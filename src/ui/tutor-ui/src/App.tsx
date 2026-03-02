import { Show, createMemo, createSignal } from 'solid-js';
import './styles.css';

import type { AdminTab, AnyChat, AuthResponse, Chat, Message, Prompt, TempChat, User } from './types';
import type { UserForm } from './types';

import { AdminApi, AuthApi, ChatApi, UserApi } from './api';

import AuthCard from './components/AuthCard';
import MainLayout from './components/MainLayout';
import UserLayout from './components/UserLayout';
import AdminPanel from './components/AdminPanel';
import ProfileModal from './components/ProfileModal';

export default function App() {
    const [auth, setAuth] = createSignal<AuthResponse | null>(null);
    const [login, setLogin] = createSignal({ username: '', password: '' });
    const [error, setError] = createSignal('');

    const [chats, setChats] = createSignal<Chat[]>([]);
    const [activeChat, setActiveChat] = createSignal<Chat | null>(null);
    const [messages, setMessages] = createSignal<Message[]>([]);
    const [draft, setDraft] = createSignal('');

    const [selectedUserImage, setSelectedUserImage] = createSignal<File | null>(null);

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
            setProfileContact(data.user.contact ?? '');

            if (data.user.role === 'USER') await loadUserChats(data.token);
            else await loadAdminData(data.token);
        } catch (e) {
            setError(String(e));
        }
    };

    const logout = () => {
        setAuth(null);
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
        const result = await ChatApi.messagesMine(chat.id, tk);
        setMessages(result);
    };

    const isTempChat = (c: AnyChat): c is TempChat => (c as any).__temp === true;

    const makeTempChat = (name = "New chat"): TempChat => ({
        id: `tmp-${crypto.randomUUID()}`,
        name,
        createdAt: new Date().toISOString(),
        __temp: true,
    });

    const createUserChatLocal = (autoselect = true) => {
        const temp = makeTempChat("Новый чат");
        setChats((prev) => [temp as any, ...prev]);
        if (autoselect) {
            setActiveChat(temp as any);
            setMessages([]);
        }
    };

    const sendUserMessage = async () => {
        const text = draft().trim();

        const image = selectedUserImage();
        if (!text && !image) return;

        let chat = activeChat();
        if (!chat) {
            createUserChatLocal(true);
            chat = activeChat();
            if (!chat) return;
        }

        setMessages((prev) => [
            ...prev,
            { content: text, type: "USER", chatId: chat!.id, timestamp: new Date().toISOString() },
        ]);
        setDraft("");
        setSelectedUserImage(null);

        if (isTempChat(chat as any)) {
            const created = await ChatApi.createMine({ message: text, name: "" }, token());
            setChats((prev) => prev.map((c: any) => (c.id === chat!.id ? created : c)));
            setActiveChat(created);

            const reply = image
                ? await ChatApi.sendMessageWithImage(created.id, text, image, token(), true)
                : await ChatApi.sendMessage(created.id, text, token());
            setMessages((prev) => [
                ...prev.map((m) => (m.chatId === chat!.id ? { ...m, chatId: created.id } : m)),
                reply,
            ]);
            return;
        }

        const reply = image
            ? await ChatApi.sendMessageWithImage((chat as any).id, text, image, token(), true)
            : await ChatApi.sendMessage((chat as any).id, text, token());
        setMessages((prev) => [...prev, reply]);
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
        const result = await AdminApi.chatMessages(chatId, token());
        setAdminMessages(result);
    };

    const createAdminChat = async () => {
        const created = await AdminApi.createChat({ name: 'Новый чат', message: '' }, token(), true);
        setMyChats((prev) => [created, ...prev]);
        setAdminTab('my_chats');
        setSelectedMyChatId(created.id);
        setMyChatMessages([]);
    };

    const createAdminPromptlessChat = async () => {
        const created = await AdminApi.createChat({ name: 'Чат без промпта', message: '' }, token(), false);
        setMyChats((prev) => [created, ...prev]);
        setAdminTab('my_chats');
        setSelectedMyChatId(created.id);
        setMyChatMessages([]);
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
        const msgs = await AdminApi.chatMessages(chatId, token());
        setMyChatMessages(msgs);
    };

    const sendMyChatMessage = async () => {
        const text = myChatDraft().trim();
        const image = selectedMyChatImage();
        if ((!text && !image) || !selectedMyChatId()) return;

        setMyChatMessages((prev) => [
            ...prev,
            { content: text, type: 'USER', chatId: selectedMyChatId(), timestamp: new Date().toISOString() },
        ]);
        setMyChatDraft('');
        setSelectedMyChatImage(null);

        const reply = image
            ? await AdminApi.sendMessageWithImage(selectedMyChatId(), text, image, token(), true)
            : await AdminApi.sendMessage(selectedMyChatId(), text, token(), true);
        setMyChatMessages((prev) => [...prev, reply]);
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
        const msgs = await AdminApi.chatMessages(chatId, token());
        setUserChatMessages(msgs);
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
                                    onCreateChat={createAdminChat}
                                    onCreatePromptlessChat={createAdminPromptlessChat}

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
                                />
                            }
                        >
                            <UserLayout
                                chats={chats}
                                activeChat={activeChat}
                                messages={messages}
                                selectedImageName={() => selectedUserImage()?.name ?? null}
                                draft={draft}
                                onNewChat={() => createUserChatLocal(true)}
                                onOpenChat={openChat}
                                setDraft={setDraft}
                                onSend={sendUserMessage}
                                onSelectImage={setSelectedUserImage}
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
