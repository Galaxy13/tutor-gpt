import { For, Show } from 'solid-js'
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

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            props.onSend();
        }
    };

    return (
        <div class="chat-layout">
            <aside class="chat-sidebar">
                <div class="sidebar-header">
                    <h3>Чаты</h3>
                    <button class="btn-sm" onClick={props.onNewChat}>+ Новый</button>
                </div>

                <div class="sidebar-list">
                    <For each={props.chats()}>
                        {(chat) => (
                            <button
                                class={`sidebar-btn ${props.activeChat()?.id === chat.id ? "active" : ""}`}
                                onClick={() => props.onOpenChat(chat)}
                            >
                                <strong>{chat.name || "Новый чат"}</strong>
                                <small>{new Date(chat.createdAt).toLocaleString()}</small>
                            </button>
                        )}
                    </For>
                </div>
            </aside>

            <div class="chat-main">
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
