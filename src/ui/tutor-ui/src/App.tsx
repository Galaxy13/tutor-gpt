import { Show, createMemo, createSignal } from 'solid-js';
import './styles.css';

import type {AdminTab, AnyChat, AuthResponse, Chat, Message, Prompt, TempChat, User} from './types';
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

    const [adminActiveChat, setAdminActiveChat] = createSignal<AnyChat | null>(null);
    const [adminDraft, setAdminDraft] = createSignal("");

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
    })

    const [showCreateUserModal, setShowCreateUserModal] = createSignal(false);
    const [newUserDraft, setNewUserDraft] = createSignal<UserForm>(emptyUserForm());

    const [testChatId, setTestChatId] = createSignal('');
    const [testDraft, setTestDraft] = createSignal('');

    const token = createMemo(() => auth()?.token ?? '');
    const isAdmin = createMemo(() => auth()?.user.role === 'ADMIN');

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

        setUsers([]);
        setAllChats([]);
        setAdminMessages([]);
        setPrompts([]);
        setSelectedAdminChatId('');
        setAdminTab('users');
    };

    // ---- USER FLOW ----

    const loadUserChats = async (tk = token()) => {
        const result = await ChatApi.listMine(tk);
        setChats(result);

        if (result.length > 0) await openChat(result[0], tk);
        else await createUserChat(true, tk);
    };

    const createUserChat = async (autoselect = true, tk = token()) => {
        const created = await ChatApi.createMine({message: "", name: ''}, tk);
        setChats((prev) => [created, ...prev]);

        if (autoselect) {
            setActiveChat(created);
            setMessages([]);
        }
    };

    const openChat = async (chat: Chat, tk = token()) => {
        setActiveChat(chat);
        const result = await ChatApi.messagesMine(chat.id, tk);
        setMessages(result);
    };

    const sendUserMessage = async () => {
        const text = draft().trim();
        if (!text) return;

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

        if (isTempChat(chat as any)) {
            const created = await ChatApi.createMine({ message: text, name: "" }, token());

            setChats((prev) => prev.map((c: any) => (c.id === chat!.id ? created : c)));

            setActiveChat(created);

            const reply = await ChatApi.sendMessage(created.id, text, token());
            setMessages((prev) => [
                ...prev.map((m) => (m.chatId === chat!.id ? { ...m, chatId: created.id } : m)),
                reply,
            ]);

            return;
        }

        const reply = await ChatApi.sendMessage((chat as any).id, text, token());
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

    const openCreateUserModal = () => {
        setNewUserDraft(emptyUserForm());
        setShowCreateUserModal(true);
    };

    const closeCreateUserModal = () => setShowCreateUserModal(false);

    const submitCreateUser = async () => {
        await AdminApi.createUser(newUserDraft(), token());
        setShowCreateUserModal(false);
        await loadAdminData();
    };


    const deleteUser = async (id: string) => {
        await AdminApi.deleteUser(id, token());
        await loadAdminData();
    };

    const createPrompt = async () => {
        const content = Object.fromEntries(
            promptParts()
                .filter((p) => p.key.trim())
                .map((p) => [p.key.trim(), p.value]),
        );
        await AdminApi.createPrompt(content, token());
        await loadAdminData();
    };

    const openAdminChat = async (chatId: string) => {
        setSelectedAdminChatId(chatId);
        const result = await AdminApi.chatMessages(chatId, token());
        setAdminMessages(result);
    };

    const createAdminNoPromptChat = async () => {
        const created = await AdminApi.createChatWithoutPrompt({ name: 'Admin no-prompt chat', message: ''}, token());
        setAllChats((prev) => [created, ...prev]);
    };

    const sendPromptTestMessage = async () => {
        const text = testDraft().trim();
        if (!text || !testChatId()) return;

        const reply = await AdminApi.sendChatWithoutPrompt(testChatId(), text, token());
        setAdminMessages((prev) => [
            ...prev,
            { content: text, type: 'USER', chatId: testChatId(), timestamp: new Date().toISOString() },
            reply,
        ]);
        setTestDraft('');
    };

    const isTempChat = (c: AnyChat): c is TempChat => (c as any).__temp === true;

    const makeTempChat = (name = "New chat"): TempChat => ({
        id: `tmp-${crypto.randomUUID()}`,
        name,
        createdAt: new Date().toISOString(),
        __temp: true,
    });

    const createUserChatLocal = (autoselect = true) => {
        const temp = makeTempChat("New chat");
        setChats((prev) => [temp as any, ...prev]);
        if (autoselect) {
            setActiveChat(temp as any);
            setMessages([]);
        }
    };

    const createAdminPromptlessChatLocal = (autoselect = true) => {
        const temp = makeTempChat("Admin promptless chat");
        setAllChats((prev) => [temp as any, ...prev]); // allChats: AnyChat[]
        if (autoselect) {
            setAdminActiveChat(temp as any);
            setAdminMessages([]);
        }
    };

    const sendAdminPromptlessMessage = async () => {
        const text = adminDraft().trim();
        if (!text) return;

        let chat = adminActiveChat();
        if (!chat) {
            createAdminPromptlessChatLocal(true);
            chat = adminActiveChat();
            if (!chat) return;
        }

        // optimistic user/admin message
        setAdminMessages((prev) => [
            ...prev,
            { content: text, type: "USER", chatId: chat!.id, timestamp: new Date().toISOString() },
        ]);
        setAdminDraft("");

        // temp → create on server using first message
        if (isTempChat(chat as any)) {
            const created = await AdminApi.createChatWithoutPrompt(
                { name: "Admin promptless chat", message: text },
                token(),
            );

            setAllChats((prev) => prev.map((c: any) => (c.id === chat!.id ? created : c)));
            setAdminActiveChat(created);

            // if create endpoint does not return assistant reply, call send
            const reply = await AdminApi.sendChatWithoutPrompt(created.id, text, token());

            setAdminMessages((prev) => [
                ...prev.map((m) => (m.chatId === chat!.id ? { ...m, chatId: created.id } : m)),
                reply,
            ]);
            return;
        }

        // existing promptless chat
        const reply = await AdminApi.sendChatWithoutPrompt((chat as any).id, text, token());
        setAdminMessages((prev) => [...prev, reply]);
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
                                    adminDraft={adminDraft}
                                    setAdminDraft={setAdminDraft}
                                    onSendAdminPromptless={sendAdminPromptlessMessage}
                                    users={users}
                                    allChats={allChats}
                                    selectedAdminChatId={selectedAdminChatId}
                                    adminMessages={adminMessages}
                                    prompts={prompts}
                                    promptParts={promptParts}
                                    setPromptParts={setPromptParts}
                                    testChatId={testChatId}
                                    setTestChatId={setTestChatId}
                                    testDraft={testDraft}
                                    setTestDraft={setTestDraft}
                                    onCreateUser={openCreateUserModal}
                                    onDeleteUser={deleteUser}
                                    onOpenAdminChat={openAdminChat}
                                    onCreatePrompt={createPrompt}
                                    onCreateAdminNoPromptChat={createAdminNoPromptChat}
                                    onSendPromptTestMessage={sendPromptTestMessage}
                                    showCreateUserModal={showCreateUserModal}
                                    setShowCreateUserModal={setShowCreateUserModal}
                                    newUserDraft={newUserDraft}
                                    setNewUserDraft={setNewUserDraft}
                                    onSubmitCreate={submitCreateUser}
                                />
                            }
                        >
                            <UserLayout
                                chats={chats}
                                activeChat={activeChat}
                                messages={messages}
                                draft={draft}
                                onNewChat={() => createUserChatLocal(true)}
                                onOpenChat={openChat}
                                setDraft={setDraft}
                                onSend={sendUserMessage}
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
