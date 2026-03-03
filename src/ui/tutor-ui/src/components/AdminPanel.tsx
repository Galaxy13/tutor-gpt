import {Accessor, For, Index, Show} from "solid-js";
import { marked } from "marked";
import type { AdminTab, Chat, Message, Prompt, User, UserForm } from "../types";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

const md = (text: string) => marked.parse(text, { async: false }) as string;

export default function AdminPanel(props: {
    adminTab: Accessor<AdminTab>;
    setAdminTab: (v: AdminTab) => void;

    users: Accessor<User[]>;
    allChats: Accessor<Chat[]>;
    selectedAdminChatId: Accessor<string>;
    adminMessages: Accessor<Message[]>;

    prompts: Accessor<Prompt[]>;
    promptParts: Accessor<Array<{ key: string; value: string }>>;
    setPromptParts: (fn: (prev: Array<{ key: string; value: string }>) => Array<{ key: string; value: string }>) => void;

    onCreateUser: () => void;
    onDeleteUser: (id: string) => void;
    onUpdateUser: (user: User) => void;

    onOpenAdminChat: (chatId: string) => void;
    onCreatePrompt: () => void;
    onCreateChat: () => void;
    onCreatePromptlessChat: () => void;

    showCreateUserModal: Accessor<boolean>;
    setShowCreateUserModal: (v: boolean) => void;
    newUserDraft: Accessor<UserForm>;
    setNewUserDraft: (fn: (prev: UserForm) => UserForm) => void;
    onSubmitCreate: () => void;

    showEditUserModal: Accessor<boolean>;
    editUserDraft: Accessor<UserForm>;
    setEditUserDraft: (fn: (prev: UserForm) => UserForm) => void;
    onCloseEditModal: () => void;
    onSubmitEdit: () => void;

    onOpenUserChats: (user: User) => void;
    viewingUser: Accessor<User | null>;
    userChats: Accessor<Chat[]>;
    selectedUserChatId: Accessor<string>;
    userChatMessages: Accessor<Message[]>;
    onOpenUserChat: (chatId: string) => void;

    onOpenMyChatsTab: () => void;
    myChats: Accessor<Chat[]>;
    selectedMyChatId: Accessor<string>;
    myChatMessages: Accessor<Message[]>;
    onOpenMyChat: (chatId: string) => void;
    myChatDraft: Accessor<string>;
    setMyChatDraft: (v: string) => void;
    onSendMyChatMessage: () => void;

    onSelectMyChatImage: (file: File | null) => void;
    selectedMyChatImageName: Accessor<string | null>;

    messagesLoading: Accessor<boolean>;
    myChatSending: Accessor<boolean>;
}) {
    let myChatImageInputRef: HTMLInputElement | undefined;

    const renderBubble = (msg: Message) => (
        <div class={`bubble ${msg.type === "USER" ? "user" : "assistant"}`}>
            <Show when={msg.imageUrl}>
                <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                    <img class="bubble-image" src={msg.imageUrl} alt="" />
                </a>
            </Show>
            <Show when={msg.type === "ASSISTANT"} fallback={
                <Show when={msg.content}><span>{msg.content}</span></Show>
            }>
                <div innerHTML={md(msg.content)} />
            </Show>
        </div>
    );

    const handleMyChatKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            props.onSendMyChatMessage();
        }
    };

    return (
        <div class="admin-layout">
            <nav class="admin-nav">
                <div class="nav-label">Навигация</div>

                <button
                    class={`nav-tab ${props.adminTab() === "users" ? "active" : ""}`}
                    onClick={() => props.setAdminTab("users")}
                >
                    Пользователи
                </button>

                <button
                    class={`nav-tab ${props.adminTab() === "chats" ? "active" : ""}`}
                    onClick={() => props.setAdminTab("chats")}
                >
                    Чаты
                </button>

                <button
                    class={`nav-tab ${props.adminTab() === "prompts" ? "active" : ""}`}
                    onClick={() => props.setAdminTab("prompts")}
                >
                    Промпты
                </button>

                <div class="nav-divider" />
                <div class="nav-label">Действия</div>

                <button
                    class={`nav-action ${props.adminTab() === "my_chats" ? "active" : ""}`}
                    onClick={props.onOpenMyChatsTab}
                >
                    Мои чаты
                </button>

                <button class="nav-action" onClick={props.onCreateChat}>
                    + Создать чат
                </button>

                <button class="nav-action" onClick={props.onCreatePromptlessChat}>
                    + Чат без промпта
                </button>
            </nav>

            <div class="admin-content">
                {/* ===== USERS TAB ===== */}
                <Show when={props.adminTab() === "users"}>
                    <div class="admin-content-padded">
                        <div class="section-header">
                            <h2>Пользователи</h2>
                            <button onClick={props.onCreateUser}>+ Создать пользователя</button>
                        </div>

                        <div class="users-grid">
                            <For each={props.users()} fallback={
                                <div class="empty-state"><p>Нет пользователей</p></div>
                            }>
                                {(u) => (
                                    <div class="user-card">
                                        <div class="user-details">
                                            <h3>{u.name} {u.surname}</h3>
                                            <div class="user-meta">
                                                <span class={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                                                    {u.role}
                                                </span>
                                                <Show when={u.isActive !== undefined}>
                                                    <span class={`badge ${u.isActive ? "badge-active" : "badge-inactive"}`}>
                                                        {u.isActive ? "Активен" : "Неактивен"}
                                                    </span>
                                                </Show>
                                                <Show when={u.username}>
                                                    <span>@{u.username}</span>
                                                </Show>
                                                <Show when={u.contact}>
                                                    <span>{u.contact}</span>
                                                </Show>
                                            </div>
                                        </div>
                                        <div class="user-actions">
                                            <button class="btn-outline btn-sm" onClick={() => props.onOpenUserChats(u)}>
                                                Чаты
                                            </button>
                                            <button class="btn-secondary btn-sm" onClick={() => props.onUpdateUser(u)}>
                                                Изменить
                                            </button>
                                            <button class="btn-danger btn-sm" onClick={() => props.onDeleteUser(u.id)}>
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </For>
                        </div>
                    </div>

                    <CreateUserModal
                        open={props.showCreateUserModal()}
                        draft={props.newUserDraft}
                        setDraft={props.setNewUserDraft}
                        onClose={() => props.setShowCreateUserModal(false)}
                        onSubmit={props.onSubmitCreate}
                    />
                    <EditUserModal
                        open={props.showEditUserModal}
                        draft={props.editUserDraft}
                        setDraft={props.setEditUserDraft}
                        onClose={props.onCloseEditModal}
                        onSubmit={props.onSubmitEdit}
                    />
                </Show>

                {/* ===== CHATS TAB (view-only) ===== */}
                <Show when={props.adminTab() === "chats"}>
                    <div class="chat-layout" style="height: calc(100vh - 57px)">
                        <aside class="chat-sidebar">
                            <div class="sidebar-header">
                                <h3>Все чаты</h3>
                            </div>

                            <For each={props.allChats()} fallback={
                                <div class="empty-state"><p>Нет чатов</p></div>
                            }>
                                {(c) => (
                                    <button
                                        class={`sidebar-btn ${props.selectedAdminChatId() === c.id ? "active" : ""}`}
                                        onClick={() => props.onOpenAdminChat(c.id)}
                                    >
                                        <strong>{c.name || "Без названия"}</strong>
                                        <small>
                                            {c.username ? `@${c.username}` : ""}
                                            {c.username && c.promptVersion ? " · " : ""}
                                            {c.promptVersion ? `v${c.promptVersion}` : "без промпта"}
                                            {" · "}
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </small>
                                    </button>
                                )}
                            </For>
                        </aside>

                        <div class="chat-main">
                            <Show when={props.selectedAdminChatId()} fallback={
                                <div class="empty-state" style="flex:1">
                                    <p>Выберите чат из списка слева</p>
                                </div>
                            }>
                                <div class="messages">
                                    <Show when={!props.messagesLoading()} fallback={
                                        <div class="loading-dots">
                                            <span>Загрузка...</span>
                                            <div class="dots"><span /><span /><span /></div>
                                        </div>
                                    }>
                                        <For each={props.adminMessages()}>
                                            {(msg) => renderBubble(msg)}
                                        </For>
                                    </Show>
                                </div>
                            </Show>
                        </div>
                    </div>
                </Show>

                {/* ===== MY CHATS TAB (admin's own chats with send) ===== */}
                <Show when={props.adminTab() === "my_chats"}>
                    <div class="chat-layout" style="height: calc(100vh - 57px)">
                        <aside class="chat-sidebar">
                            <div class="sidebar-header">
                                <h3>Мои чаты</h3>
                            </div>

                            <For each={props.myChats()} fallback={
                                <div class="empty-state"><p>Нет чатов</p></div>
                            }>
                                {(c) => (
                                    <button
                                        class={`sidebar-btn ${props.selectedMyChatId() === c.id ? "active" : ""}`}
                                        onClick={() => props.onOpenMyChat(c.id)}
                                    >
                                        <strong>{c.name || "Без названия"}</strong>
                                        <small>
                                            {c.promptVersion ? `v${c.promptVersion}` : "без промпта"}
                                            {" · "}
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </small>
                                    </button>
                                )}
                            </For>
                        </aside>

                        <div class="chat-main">
                            <Show when={props.selectedMyChatId()} fallback={
                                <div class="empty-state" style="flex:1">
                                    <p>Выберите чат из списка слева</p>
                                </div>
                            }>
                                <div class="messages">
                                    <Show when={!props.messagesLoading()} fallback={
                                        <div class="loading-dots">
                                            <span>Загрузка...</span>
                                            <div class="dots"><span /><span /><span /></div>
                                        </div>
                                    }>
                                        <For each={props.myChatMessages()}>
                                            {(msg) => renderBubble(msg)}
                                        </For>
                                        <Show when={props.myChatSending()}>
                                            <div class="typing-indicator">
                                                <span>Думает...</span>
                                                <div class="dots"><span /><span /><span /></div>
                                            </div>
                                        </Show>
                                    </Show>
                                </div>

                                <div class="compose">
                                    <textarea
                                        value={props.myChatDraft()}
                                        onInput={(e) => props.setMyChatDraft(e.currentTarget.value)}
                                        onKeyDown={handleMyChatKeyDown}
                                        placeholder="Напишите сообщение..."
                                    />
                                    <input
                                        ref={myChatImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        style="display:none"
                                        onChange={(e) => props.onSelectMyChatImage(e.currentTarget.files?.[0] ?? null)}
                                    />

                                    <div class="compose-actions">
                                        <button class="btn-secondary" onClick={() => myChatImageInputRef?.click()}>+ Изображение</button>
                                        <Show when={props.selectedMyChatImageName()}>
                                            <small>Файл: {props.selectedMyChatImageName()}</small>
                                        </Show>
                                        <button onClick={props.onSendMyChatMessage}>Отправить</button>
                                    </div>
                                </div>
                            </Show>
                        </div>
                    </div>
                </Show>

                {/* ===== PROMPTS TAB ===== */}
                <Show when={props.adminTab() === "prompts"}>
                    <div class="admin-content-padded">
                        <div class="section-header">
                            <h2>Промпты</h2>
                        </div>

                        <For each={props.prompts()} fallback={
                            <div class="empty-state"><p>Нет промптов</p></div>
                        }>
                            {(p) => (
                                <div class="prompt-card">
                                    <strong>Версия {p.version}</strong>
                                    <For each={Object.entries(p.content)}>
                                        {([key, value]) => (
                                            <div class="prompt-entry">
                                                <b>{key}:</b> {value}
                                            </div>
                                        )}
                                    </For>
                                </div>
                            )}
                        </For>

                        <div class="prompt-form">
                            <h3>Создать новый промпт</h3>

                            <Index each={props.promptParts()}>
                                {(part, idx) => (
                                    <div class="prompt-row">
                                        <input
                                            placeholder="Название секции"
                                            value={part().key}
                                            onInput={(e) =>
                                                props.setPromptParts(prev =>
                                                    prev.map((p, i) =>
                                                        i === idx ? { ...p, key: e.currentTarget.value } : p
                                                    )
                                                )
                                            }
                                        />
                                        <input
                                            placeholder="Содержание секции"
                                            value={part().value}
                                            onInput={(e) =>
                                                props.setPromptParts(prev =>
                                                    prev.map((p, i) =>
                                                        i === idx ? { ...p, value: e.currentTarget.value } : p
                                                    )
                                                )
                                            }
                                        />
                                        <button
                                            class="btn-ghost btn-sm"
                                            onClick={() =>
                                                props.setPromptParts(prev => prev.filter((_, i) => i !== idx))
                                            }
                                        >
                                            x
                                        </button>
                                    </div>
                                )}
                            </Index>

                            <div class="prompt-form-actions">
                                <button class="btn-secondary" onClick={() => props.setPromptParts((prev) => [...prev, { key: "", value: "" }])}>
                                    + Новая часть
                                </button>
                                <button onClick={props.onCreatePrompt}>Сохранить промпт</button>
                            </div>
                        </div>
                    </div>
                </Show>

                {/* ===== USER CHATS VIEW ===== */}
                <Show when={props.adminTab() === "user_chats"}>
                    <Show when={props.viewingUser()}>
                        {(user) => (
                            <>
                                <div class="admin-content-padded" style="padding-bottom: 0">
                                    <div class="back-row">
                                        <button class="btn-ghost btn-sm" onClick={() => props.setAdminTab("users")}>
                                            &larr; Назад
                                        </button>
                                        <h2>Чаты: {user().name} {user().surname}</h2>
                                    </div>
                                </div>

                                <div class="chat-layout" style="height: calc(100vh - 57px - 68px)">
                                    <aside class="chat-sidebar">
                                        <For each={props.userChats()} fallback={
                                            <div class="empty-state"><p>Нет чатов</p></div>
                                        }>
                                            {(c) => (
                                                <button
                                                    class={`sidebar-btn ${props.selectedUserChatId() === c.id ? "active" : ""}`}
                                                    onClick={() => props.onOpenUserChat(c.id)}
                                                >
                                                    <strong>{c.name || "Без названия"}</strong>
                                                    <small>
                                                        {c.username ? `@${c.username}` : ""}
                                                        {new Date(c.createdAt).toLocaleDateString()}
                                                    </small>
                                                </button>
                                            )}
                                        </For>
                                    </aside>

                                    <div class="chat-main">
                                        <Show when={props.selectedUserChatId()} fallback={
                                            <div class="empty-state" style="flex:1">
                                                <p>Выберите чат для просмотра</p>
                                            </div>
                                        }>
                                            <div class="messages">
                                                <Show when={!props.messagesLoading()} fallback={
                                                    <div class="loading-dots">
                                                        <span>Загрузка...</span>
                                                        <div class="dots"><span /><span /><span /></div>
                                                    </div>
                                                }>
                                                    <For each={props.userChatMessages()}>
                                                        {(msg) => renderBubble(msg)}
                                                    </For>
                                                </Show>
                                            </div>
                                        </Show>
                                    </div>
                                </div>
                            </>
                        )}
                    </Show>
                </Show>
            </div>
        </div>
    );
}
