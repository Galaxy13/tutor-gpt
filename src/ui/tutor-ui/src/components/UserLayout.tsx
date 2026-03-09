import { createSignal, For, Show } from 'solid-js'
import type { Accessor } from "solid-js";
import { marked } from "marked";
import type { Chat, Message } from "../types";

const md = (text: string) => marked.parse(text, { async: false }) as string;

export default function UserLayout(props: {
    chats: Accessor<Chat[]>;
    activeChat: Accessor<Chat | null>;
    messages: Accessor<Message[]>;
    draft: Accessor<string>;

    onNewChat: () => void;
    onOpenChat: (chat: Chat) => void;

    setDraft: (v: string) => void;
    onSend: () => void;

    selectedImageName: Accessor<string | null>;
    onSelectImage: (file: File | null) => void;

    messagesLoading: Accessor<boolean>;
    sending: Accessor<boolean>;
}) {
    let imageInputRef: HTMLInputElement | undefined;
    const [sidebarOpen, setSidebarOpen] = createSignal(window.innerWidth > 768);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            props.onSend();
        }
    };

    const handleOpenChat = (chat: Chat) => {
        props.onOpenChat(chat);
        if (window.innerWidth <= 768) setSidebarOpen(false);
    };

    return (
        <div class={`chat-layout ${!sidebarOpen() ? "sidebar-collapsed" : ""}`}>
            <aside class="chat-sidebar">
                <div class="sidebar-header">
                    <h3>Чаты</h3>
                    <div class="row" style="gap: 4px">
                        <button class="btn-sm" onClick={props.onNewChat}>+ Новый</button>
                        <button class="sidebar-toggle" onClick={() => setSidebarOpen(false)} title="Скрыть панель">&times;</button>
                    </div>
                </div>

                <div class="sidebar-list">
                    <For each={props.chats()}>
                        {(chat) => (
                            <button
                                class={`sidebar-btn ${props.activeChat()?.id === chat.id ? "active" : ""}`}
                                onClick={() => handleOpenChat(chat)}
                            >
                                <strong>{chat.name || "Новый чат"}</strong>
                                <small>{new Date(chat.createdAt).toLocaleString()}</small>
                            </button>
                        )}
                    </For>
                </div>
            </aside>

            <div class="chat-main">
                <Show when={!sidebarOpen()}>
                    <div class="chat-main-header">
                        <button class="sidebar-toggle" onClick={() => setSidebarOpen(true)} title="Показать панель">&#9776;</button>
                        <Show when={props.activeChat()}>
                            <span style="font-size: 0.85rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                                {props.activeChat()!.name || "Новый чат"}
                            </span>
                        </Show>
                    </div>
                </Show>

                <div class="messages">
                    <Show when={!props.messagesLoading()} fallback={
                        <div class="loading-dots">
                            <span>Загрузка...</span>
                            <div class="dots"><span/><span/><span/></div>
                        </div>
                    }>
                    <Show when={props.messages().length > 0} fallback={
                        <Show when={!props.sending()}>
                            <div class="empty-chat-placeholder">
                                <span class="placeholder-text">Напишите сообщение, чтобы начать...</span>
                                <div class="placeholder-dots"><span /><span /><span /></div>
                            </div>
                        </Show>
                    }>
                        <For each={props.messages()}>
                            {(msg) => (
                                <div class={`bubble ${msg.type === 'USER' ? 'user' : 'assistant'}`}>
                                    <Show when={msg.imageUrl}>
                                        <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                            <img class="bubble-image" src={msg.imageUrl} alt="" />
                                        </a>
                                    </Show>
                                    <Show when={msg.type === 'ASSISTANT'} fallback={
                                        <Show when={msg.content}><span>{msg.content}</span></Show>
                                    }>
                                        <div innerHTML={md(msg.content)}></div>
                                    </Show>
                                </div>
                            )}
                        </For>
                    </Show>
                        <Show when={props.sending()}>
                            <div class="typing-indicator">
                                <span>Думает...</span>
                                <div class="dots"><span /><span /><span /></div>
                            </div>
                        </Show>
                    </Show>
                </div>

                <div class="compose">
                    <textarea
                        value={props.draft()}
                        onInput={(e) => props.setDraft(e.currentTarget.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Напишите сообщение..."
                    />
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        style="display:none"
                        onChange={(e) => props.onSelectImage(e.currentTarget.files?.[0] ?? null)}
                    />

                    <div class="compose-actions">
                        <button class="btn-secondary" onClick={() => imageInputRef?.click()}>+ Изображение</button>
                        <Show when={props.selectedImageName()}>
                            <small>Файл: {props.selectedImageName()}</small>
                        </Show>
                        <button onClick={props.onSend}>Отправить</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
