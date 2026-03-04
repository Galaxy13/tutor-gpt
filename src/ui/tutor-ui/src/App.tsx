import { Show, createMemo, createSignal } from 'solid-js';
import './styles.css';

import type { AdminTab, AuthResponse, Chat, Message, Prompt, User } from './types';
import type { UserForm } from './types';

import { AdminApi, AuthApi, ChatApi, UserApi } from './api';

import AuthCard from './components/AuthCard';
import MainLayout from './components/MainLayout';
import UserLayout from './components/UserLayout';
import AdminPanel from './components/AdminPanel';
import AdminChatWindow from './components/AdminChatWindow';
import ProfileModal from './components/ProfileModal';

export default function App() {
    const hash = window.location.hash;
    if (hash === '#admin-chat-prompt' || hash === '#admin-chat-promptless') {
        const stored = localStorage.getItem('tutor_auth');
        if (!stored) {
            return <div class="auth-wrapper"><div class="auth-card"><h1>Сессия истекла</h1><p>Закройте окно и войдите снова.</p></div></div>;
        }
        const authData: AuthResponse = JSON.parse(stored);
        const withPrompt = hash === '#admin-chat-prompt';
        return (
            <div class="app">
                <AdminChatWindow auth={authData} withPrompt={withPrompt} />
            </div>
        );
    }
    const [auth, setAuth] = createSignal<AuthResponse | null>(null);
    const [login, setLogin] = createSignal({ username: '', password: '' });
    const [error, setError] = createSignal('');

    const [chats, setChats] = createSignal<Chat[]>([]);
    const [activeChat, setActiveChat] = createSignal<Chat | null>(null);
    const [messages, setMessages] = createSignal<Message[]>([]);
    const [draft, setDraft] = createSignal('');

    const [selectedUserImage, setSelectedUserImage] = createSignal<File | null>(null);

    const [messagesLoading, setMessagesLoading] = createSignal(false);
    const [sending, setSending] = createSignal(false);
    const [myChatSending, setMyChatSending] = createSignal(false);

    const [showProfile, setShowProfile] = createSignal(false);
    const [profileContact, setProfileContact] = createSignal('');
    const [passwords, setPasswords] = createSignal({ currentPassword: '', newPassword: '' });

    const [adminTab, setAdminTab] = createSignal<AdminTab>('users');
    const [users, setUsers] = createSignal<User[]>([]);
    const [allChats, setAllChats] = createSignal<Chat[]>([]);
    const [selectedAdminChatId, setSelectedAdminChatId] = createSignal('');
    const [adminMessages, setAdminMessages] = createSignal<Message[]>([]);
    const [prompts, setPrompts] = createSignal<Prompt[]>([]);
    const [promptParts, setPromptParts] = createSignal<Array<{ key: string; value: string }>>([
        { key: 'role', value: '' },
    ]);

    const emptyUserForm = (): UserForm => ({
        username: "",
        name: "",
        surname: "",
        role: "USER",
        contact: "",
        password: "",
        isActive: true
    });

    const [showCreateUserModal, setShowCreateUserModal] = createSignal(false);
    const [newUserDraft, setNewUserDraft] = createSignal<UserForm>(emptyUserForm());

    const [showEditUserModal, setShowEditUserModal] = createSignal(false);
    const [editUserId, setEditUserId] = createSignal('');
    const [editUserDraft, setEditUserDraft] = createSignal<UserForm>(emptyUserForm());

    const [myChats, setMyChats] = createSignal<Chat[]>([]);
    const [selectedMyChatId, setSelectedMyChatId] = createSignal('');
    const [myChatMessages, setMyChatMessages] = createSignal<Message[]>([]);
    const [myChatDraft, setMyChatDraft] = createSignal('');
    const [selectedMyChatImage, setSelectedMyChatImage] = createSignal<File | null>(null);

    const [viewingUser, setViewingUser] = createSignal<User | null>(null);
    const [userChats, setUserChats] = createSignal<Chat[]>([]);
    const [selectedUserChatId, setSelectedUserChatId] = createSignal('');
    const [userChatMessages, setUserChatMessages] = createSignal<Message[]>([]);

    const token = createMemo(() => auth()?.token ?? '');
    const isAdmin = createMemo(() => auth()?.user.role === 'ADMIN');

    // ---- AUTH ----

    const doLogin = async () => {
        setError('');
        try {
            const data = await AuthApi.login(login());
            setAuth(data);
            localStorage.setItem('tutor_auth', JSON.stringify(data));
            setProfileContact(data.user.contact ?? '');

            if (data.user.role === 'USER') await loadUserChats(data.token);
            else await loadAdminData(data.token);
        } catch (e) {
            setError(String(e));
        }
    };

    const logout = () => {
        setAuth(null);
        localStorage.removeItem('tutor_auth');
        setChats([]);
        setMessages([]);
        setActiveChat(null);
        setSelectedUserImage(null);
        setUsers([]);
        setAllChats([]);
        setAdminMessages([]);
        setPrompts([]);
        setSelectedAdminChatId('');
        setAdminTab('users');
        setMyChats([]);
        setSelectedMyChatId('');
        setSelectedMyChatImage(null);
        setMyChatMessages([]);
        setMyChatDraft('');
        setViewingUser(null);
        setUserChats([]);
        setSelectedUserChatId('');
        setUserChatMessages([]);
        setMessagesLoading(false);
        setSending(false);
        setMyChatSending(false);
    };

    // ---- USER FLOW ----

    const loadUserChats = async (tk = token()) => {
        const result = await ChatApi.listMine(tk);
        setChats(result);

        if (result.length > 0) await openChat(result[0], tk);
        else await createUserChat(true, tk);
    };

    const createUserChat = async (autoselect = true, tk = token()) => {
        const created = await ChatApi.createMine({ message: "", name: '' }, tk);
        setChats((prev) => [created, ...prev]);

        if (autoselect) {
            setActiveChat(created);
            setMessages([]);
        }
    };

    const openChat = async (chat: Chat, tk = token()) => {
        setSelectedUserImage(null);
        setActiveChat(chat);
        setMessagesLoading(true);
        try {
            const result = await ChatApi.messagesMine(chat.id, tk);
            setMessages(result);
        } finally {
            setMessagesLoading(false);
        }
    };

    const clearChat = (autoselect = true) => {
        if (autoselect) {
            setActiveChat(null);
            setMessages([]);
        }
    };

    const sendUserMessage = async () => {
        const text = draft().trim();
        const image = selectedUserImage();
        if (!text && !image) return;

        const tokenValue = token();
        if (!tokenValue) return;

        const existingChat = activeChat();

        const tempChatId = crypto.randomUUID();
        let chatId = existingChat?.id ?? tempChatId;

        const userMessage = {
            content: text,
            type: "USER" as const,
            chatId,
            timestamp: new Date().toISOString(),
            imageUrl: image ? URL.createObjectURL(image) : undefined,
        };

        setMessages(prev => [...prev, userMessage]);
        setDraft("");
        setSelectedUserImage(null);
        setSending(true);

        try {
            if (!existingChat) {
                const created = await ChatApi.createMine({ message: text, name: "" }, tokenValue);

                setChats(prev => [...prev, created]);
                setActiveChat(created);

                chatId = created.id;
                setMessages(prev =>
                    prev.map(m => (m.chatId === tempChatId ? { ...m, chatId: created.id } : m))
                );
            }

            const reply = image
                ? await ChatApi.sendMessageWithImage(chatId, text, image, tokenValue, true)
                : await ChatApi.sendMessage(chatId, text, tokenValue);

            setMessages(prev => [...prev, reply]);
        } finally {
            setSending(false);
        }
    };

    // ---- PROFILE ----

    const updateProfile = async () => {
        await UserApi.mePatch({ contact: profileContact() }, token());
    };

    const changePassword = async () => {
        await UserApi.changePassword(passwords(), token());
        setPasswords({ currentPassword: '', newPassword: '' });
    };

    // ---- ADMIN FLOW ----

    const loadAdminData = async (tk = token()) => {
        const [u, c, p] = await Promise.all([AdminApi.users(tk), AdminApi.chats(tk), AdminApi.prompts(tk)]);
        setUsers(u);
        setAllChats(c);
        setPrompts(p);
    };

    // -- Create User --

    const openCreateUserModal = () => {
        setNewUserDraft(emptyUserForm());
        setShowCreateUserModal(true);
    };

    const submitCreateUser = async () => {
        await AdminApi.createUser(newUserDraft(), token());
        setShowCreateUserModal(false);
        await loadAdminData();
    };

    // -- Edit User --

    const openEditUserModal = (user: User) => {
        setEditUserId(user.id);
        setEditUserDraft({
            username: user.username ?? '',
            name: user.name,
            surname: user.surname,
            role: user.role,
            contact: user.contact ?? '',
            password: '',
            isActive: user.isActive ?? true,
        });
        setShowEditUserModal(true);
    };

    const submitEditUser = async () => {
        const d = editUserDraft();
        await AdminApi.updateUser(editUserId(), {
            username: d.username,
            name: d.name,
            surname: d.surname,
            role: d.role,
            contact: d.contact,
            isActive: d.isActive,
        }, token());

        if (d.password.trim()) {
            await AdminApi.resetPassword(editUserId(), d.password, token());
        }

        setShowEditUserModal(false);
        await loadAdminData();
    };

    // -- Delete User --

    const deleteUser = async (id: string) => {
        await AdminApi.deleteUser(id, token());
        await loadAdminData();
    };

    // -- Prompts --

    const createPrompt = async () => {
        const content = Object.fromEntries(
            promptParts()
                .filter((p) => p.key.trim())
                .map((p) => [p.key.trim(), p.value]),
        );
        await AdminApi.createPrompt(content, token());
        await loadAdminData();
    };

    // -- Admin Chats --

    const openAdminChat = async (chatId: string) => {
        setSelectedAdminChatId(chatId);
        setMessagesLoading(true);
        try {
            const result = await AdminApi.chatMessages(chatId, token());
            setAdminMessages(result);
        } finally {
            setMessagesLoading(false);
        }
    };

    const openAdminChatWindow = (withPrompt: boolean) => {
        const hashVal = withPrompt ? 'admin-chat-prompt' : 'admin-chat-promptless';
        const url = `${window.location.origin}${window.location.pathname}#${hashVal}`;
        window.open(url, `admin-chat-${hashVal}`, 'width=1200,height=800');
    };

    // -- My Chats (admin's own chats) --

    const openMyChatsTab = async () => {
        setAdminTab('my_chats');
        const userId = auth()?.user.id;
        if (!userId) return;
        try {
            const chats = await AdminApi.userChats(userId, token());
            setMyChats(chats);
        } catch {
            setMyChats([]);
        }
    };

    const openMyChat = async (chatId: string) => {
        setSelectedMyChatImage(null);
        setSelectedMyChatId(chatId);
        setMessagesLoading(true);
        try {
            const msgs = await AdminApi.chatMessages(chatId, token());
            setMyChatMessages(msgs);
        } finally {
            setMessagesLoading(false);
        }
    };

    const sendMyChatMessage = async () => {
        const text = myChatDraft().trim();
        const image = selectedMyChatImage();
        if ((!text && !image) || !selectedMyChatId()) return;

        setMyChatMessages((prev) => [
            ...prev,
            {
                content: text, type: 'USER', chatId: selectedMyChatId(),
                timestamp: new Date().toISOString(),
                imageUrl: image ? URL.createObjectURL(image) : undefined,
            },
        ]);
        setMyChatDraft('');
        setSelectedMyChatImage(null);
        setMyChatSending(true);

        try {
            const reply = image
                ? await AdminApi.sendMessageWithImage(selectedMyChatId(), text, image, token(), true)
                : await AdminApi.sendMessage(selectedMyChatId(), text, token(), true);
            setMyChatMessages((prev) => [...prev, reply]);
        } finally {
            setMyChatSending(false);
        }
    };

    // -- View User Chats --

    const openUserChats = async (user: User) => {
        setViewingUser(user);
        setSelectedUserChatId('');
        setUserChatMessages([]);
        setAdminTab('user_chats');
        try {
            const chats = await AdminApi.userChats(user.id, token());
            setUserChats(chats);
        } catch {
            setUserChats([]);
        }
    };

    const openUserChat = async (chatId: string) => {
        setSelectedUserChatId(chatId);
        setMessagesLoading(true);
        try {
            const msgs = await AdminApi.chatMessages(chatId, token());
            setUserChatMessages(msgs);
        } finally {
            setMessagesLoading(false);
        }
    };

    return (
        <div class="app">
            <Show
                when={auth()}
                fallback={<AuthCard
                    login={login}
                    setLogin={setLogin}
                    error={error}
                    onLogin={doLogin} />}
            >
                {(a) => (
                    <MainLayout auth={a()} onOpenProfile={() => setShowProfile(true)} onLogout={logout}>
                        <Show
                            when={!isAdmin()}
                            fallback={
                                <AdminPanel
                                    adminTab={adminTab}
                                    setAdminTab={setAdminTab}

                                    users={users}
                                    allChats={allChats}
                                    selectedAdminChatId={selectedAdminChatId}
                                    adminMessages={adminMessages}

                                    prompts={prompts}
                                    promptParts={promptParts}
                                    setPromptParts={setPromptParts}

                                    onCreateUser={openCreateUserModal}
                                    onDeleteUser={deleteUser}
                                    onUpdateUser={openEditUserModal}

                                    onOpenAdminChat={openAdminChat}
                                    onCreatePrompt={createPrompt}
                                    onOpenAdminChatWindow={openAdminChatWindow}

                                    showCreateUserModal={showCreateUserModal}
                                    setShowCreateUserModal={setShowCreateUserModal}
                                    newUserDraft={newUserDraft}
                                    setNewUserDraft={setNewUserDraft}
                                    onSubmitCreate={submitCreateUser}

                                    showEditUserModal={showEditUserModal}
                                    editUserDraft={editUserDraft}
                                    setEditUserDraft={setEditUserDraft}
                                    onCloseEditModal={() => setShowEditUserModal(false)}
                                    onSubmitEdit={submitEditUser}

                                    onOpenUserChats={openUserChats}
                                    viewingUser={viewingUser}
                                    userChats={userChats}
                                    selectedUserChatId={selectedUserChatId}
                                    userChatMessages={userChatMessages}
                                    onOpenUserChat={openUserChat}

                                    onOpenMyChatsTab={openMyChatsTab}
                                    myChats={myChats}
                                    selectedMyChatId={selectedMyChatId}
                                    myChatMessages={myChatMessages}
                                    onOpenMyChat={openMyChat}
                                    myChatDraft={myChatDraft}
                                    setMyChatDraft={setMyChatDraft}
                                    onSendMyChatMessage={sendMyChatMessage}
                                    onSelectMyChatImage={setSelectedMyChatImage}
                                    selectedMyChatImageName={() => selectedMyChatImage()?.name ?? null}
                                    messagesLoading={messagesLoading}
                                    myChatSending={myChatSending}
                                />
                            }
                        >
                            <UserLayout
                                chats={chats}
                                activeChat={activeChat}
                                messages={messages}
                                selectedImageName={() => selectedUserImage()?.name ?? null}
                                draft={draft}
                                onNewChat={() => clearChat(true)}
                                onOpenChat={openChat}
                                setDraft={setDraft}
                                onSend={sendUserMessage}
                                onSelectImage={setSelectedUserImage}
                                messagesLoading={messagesLoading}
                                sending={sending}
                            />
                        </Show>

                        <ProfileModal
                            open={showProfile}
                            onClose={() => setShowProfile(false)}
                            profileContact={profileContact}
                            setProfileContact={setProfileContact}
                            onSaveContact={updateProfile}
                            passwords={passwords}
                            setPassword={setPasswords}
                            onChangePassword={changePassword}
                        />
                    </MainLayout>
                )}
            </Show>
        </div>
    );
}
