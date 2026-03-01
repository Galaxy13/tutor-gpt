import {Accessor, For, Show} from "solid-js";
import {AdminTab, Chat, Message, Prompt, User, UserForm} from "../types";
import CreateUserModal from "./CreateUserModal"

export default function AdminPanel(props: {
    adminTab: Accessor<AdminTab>;
    setAdminTab: (v: AdminTab) => void;

    users: Accessor<User[]>;
    allChats: Accessor<Chat[]>;
    selectedAdminChatId: Accessor<string>;
    adminMessages: Accessor<Message[]>;

    prompts: Accessor<Prompt[]>;
    promptParts: Accessor<Array<{key: string, value: string}>>;
    setPromptParts: (fn: (prev: Array<{key: string, value: string}>) => Array<{key: string, value: string}>) => void;

    testChatId: Accessor<string>;
    setTestChatId: (v: string) => void;
    testDraft: Accessor<string>;
    setTestDraft(v: string): void;

    onCreateUser: () => void;
    onDeleteUser: (id: string) => void;

    onOpenAdminChat: (chatId: string) => void;

    onCreatePrompt: () => void;

    onCreateAdminNoPromptChat: () => void;
    onSendPromptTestMessage: () => void;

    adminDraft: Accessor<string>;
    setAdminDraft: (v: string) => void;
    onSendAdminPromptless: () => void;

    showCreateUserModal: Accessor<boolean>;
    setShowCreateUserModal: (v: boolean) => void;

    newUserDraft: Accessor<UserForm>;
    setNewUserDraft: (fn: (prev: UserForm) => UserForm) => void;
    onSubmitCreate: () => void;
}) {
    return (
        <div class="content admin-grid">
            <nav>
                <button
                    classList={{ active: props.adminTab() === "users" }}
                    onClick={() => props.setAdminTab("users")}
                >
                    Пользователи
                </button>

                <button
                    classList={{ active: props.adminTab() === "chats" }}
                    onClick={() => props.setAdminTab("chats")}
                >
                    Чаты
                </button>

                <button
                    classList={{ active: props.adminTab() === "prompts" }}
                    onClick={() => props.setAdminTab("prompts")}
                >
                    Управление Промптом
                </button>

                <button
                    classList={{ active: props.adminTab() === "test" }}
                    onClick={() => props.setAdminTab("test")}
                >
                    Тест
                </button>
            </nav>

            <section>
                <Show when={props.adminTab() === 'users'}>
                    <h2>Пользователи</h2>
                    <button onClick={props.onCreateUser}>Создать пользователя</button>

                    <CreateUserModal
                        open={props.showCreateUserModal()}
                        draft={props.newUserDraft}
                        setDraft={props.setNewUserDraft}
                        onClose={() => props.setShowCreateUserModal(false)}
                        onSubmit={props.onSubmitCreate}
                        />

                    <For each={props.users()}>
                        {(u) => (
                            <div class="card">
                                <div>
                                    {u.name} {u.surname} ({u.role})
                                </div>
                                <div>{u.contact}</div>
                                <div class="row">
                                    <button onClick={() => props.onDeleteUser(u.id)}>Delete</button>
                                </div>
                            </div>
                        )}
                    </For>
                </Show>

                <Show when={props.adminTab() === "chats"}>
                    <h2>Чаты</h2>

                    <div class="two-col">
                        <aside class="admin-chat-list">
                            <button onClick={props.onCreateAdminNoPromptChat}>
                                + New promptless chat
                            </button>

                            <For each={props.allChats()}>
                                {(c) => (
                                    <button
                                        onClick={() => props.onOpenAdminChat(c.id)}
                                        class={props.selectedAdminChatId() === c.id ? "active" : ""}
                                    >
                                        {c.name} · prompt v{c.promptVersion ?? "none"}
                                    </button>
                                )}
                            </For>
                        </aside>

                        <section>
                            <div class="messages">
                                <For each={props.adminMessages()}>
                                    {(msg) => (
                                        <div class={`bubble ${msg.type === "USER" ? "user" : "assistant"}`}>
                                            {msg.content}
                                        </div>
                                    )}
                                </For>
                            </div>

                            <div class="compose">
                                <textarea
                                    value={props.adminDraft()}
                                    onInput={(e) => props.setAdminDraft(e.currentTarget.value)}
                                    placeholder="Напишите сообщение..."
                                />
                                <button onClick={props.onSendAdminPromptless}>
                                    Отправить
                                </button>
                            </div>
                        </section>
                    </div>
                </Show>

                <Show when={props.adminTab() === 'prompts'}>
                    <h2>Промпты</h2>
                    <For each={props.prompts()}>
                        {(p) => (
                            <div class="card">
                                <strong>Версия {p.version}</strong>
                                <For each={Object.entries(p.content)}>
                                    {([key, value]) => (
                                        <div>
                                            <b>{key}:</b> {value}
                                        </div>
                                    )}
                                </For>
                            </div>
                        )}
                    </For>

                    <h3>Создать новый промпт</h3>

                    <For each={props.promptParts()}>
                        {(part, idx) => (
                            <div class="row">
                                <input
                                    placeholder="Название секции"
                                    value={part.key}
                                    onInput={(e) => props.setPromptParts((prev) =>
                                    prev.map((p, i) => (i === idx() ? {...p, key: e.currentTarget.value} : p)))}
                                />
                                <input
                                    placeholder="Промпт секци"
                                    value={part.value}
                                    onInput={(e) =>
                                        props.setPromptParts((prev) =>
                                            prev.map((p, i) => (i === idx() ? { ...p, value: e.currentTarget.value } : p)),
                                        )
                                    }
                                />
                                <button onClick={() => props.setPromptParts((prev) => prev.filter((_, i) => i !== idx()))}>
                                    x
                                </button>
                            </div>
                        )}
                    </For>

                    <button onClick={() => props.setPromptParts((prev) => [...prev, {key: '', value: ''}])}>
                        + Новая часть
                    </button>
                    <button onClick={props.onCreatePrompt}>Сохранить промпт</button>
                </Show>

                <Show when={props.adminTab() === 'test'}>
                    <h2>Prompt test chat</h2>
                    <button onClick={props.onCreateAdminNoPromptChat}>Create my admin no-prompt chat</button>

                    <input placeholder="chat id" value={props.testChatId()} onInput={(e) => props.setTestChatId(e.currentTarget.value)} />
                    <textarea placeholder="message" value={props.testDraft()} onInput={(e) => props.setTestDraft(e.currentTarget.value)} />
                    <button onClick={props.onSendPromptTestMessage}>Send to test chat</button>
                </Show>
            </section>
        </div>
    )
}