import { createSignal, For, Show } from 'solid-js';
import { marked } from 'marked';
import type { AuthResponse, Chat, Message } from '../types';
import { AdminApi } from '../api';

const md = (text: string) => marked.parse(text, { async: false }) as string;

export default function AdminChatWindow(props: { auth: AuthResponse; withPrompt: boolean }) {
    const [chats, setChats] = createSignal<Chat[]>([]);
    const [selectedChatId, setSelectedChatId] = createSignal('');
    const [messages, setMessages] = createSignal<Message[]>([]);
    const [draft, setDraft] = createSignal('');
    const [sending, setSending] = createSignal(false);
    const [messagesLoading, setMessagesLoading] = createSignal(false);
    const [selectedImage, setSelectedImage] = createSignal<File | null>(null);

    let imageInputRef: HTMLInputElement | undefined;

    const token = () => props.auth.token;
    const userId = () => props.auth.user.id;

    const loadChats = async () => {
        try {
            const all = await AdminApi.userChats(userId(), token());
            const filtered = props.withPrompt
                ? all.filter(c => c.promptVersion != null)
                : all.filter(c => c.promptVersion == null);
            setChats(filtered);
        } catch {
            setChats([]);
        }
    };

    loadChats();

    const openChat = async (chatId: string) => {
        setSelectedImage(null);
        setSelectedChatId(chatId);
        setMessagesLoading(true);
        try {
            const msgs = await AdminApi.chatMessages(chatId, token());
            setMessages(msgs);
        } finally {
            setMessagesLoading(false);
        }
    };

    const createChat = async () => {
        const name = props.withPrompt ? 'Новый чат' : 'Чат без промпта';
        const created = await AdminApi.createChat({ name, message: '' }, token(), props.withPrompt);
        setChats(prev => [created, ...prev]);
        setSelectedChatId(created.id);
        setMessages([]);
    };

    const sendMessage = async () => {
        const text = draft().trim();
        const image = selectedImage();
        if (!text && !image) return;
        if (!selectedChatId()) return;

        setMessages(prev => [
            ...prev,
            {
                content: text,
                type: 'USER' as const,
                chatId: selectedChatId(),
                timestamp: new Date().toISOString(),
                imageUrl: image ? URL.createObjectURL(image) : undefined,
            },
        ]);
        setDraft('');
        setSelectedImage(null);
        setSending(true);

        try {
            const reply = image
                ? await AdminApi.sendMessageWithImage(selectedChatId(), text, image, token(), props.withPrompt)
                : await AdminApi.sendMessage(selectedChatId(), text, token(), props.withPrompt);
            setMessages(prev => [...prev, reply]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div class="chat-layout" style="height: 100vh;">
            <aside class="chat-sidebar">
                <div class="sidebar-header">
                    <h3>{props.withPrompt ? 'С промптом' : 'Без промпта'}</h3>
                    <button class="btn-sm" onClick={createChat}>+ Новый</button>
                </div>

                <div class="sidebar-list">
                    <For each={chats()}>
                        {(chat) => (
                            <button
                                class={`sidebar-btn ${selectedChatId() === chat.id ? 'active' : ''}`}
                                onClick={() => openChat(chat.id)}
                            >
                                <strong>{chat.name || 'Новый чат'}</strong>
                                <small>
                                    {chat.promptVersion ? `v${chat.promptVersion} · ` : ''}
                                    {new Date(chat.createdAt).toLocaleString()}
                                </small>
                            </button>
                        )}
                    </For>
                </div>
            </aside>

            <div class="chat-main">
                <div class="messages">
                    <Show when={!messagesLoading()} fallback={
                        <div class="loading-dots">
                            <span>Загрузка...</span>
                            <div class="dots"><span /><span /><span /></div>
                        </div>
                    }>
                        <Show when={selectedChatId()} fallback={
                            <div class="empty-chat-placeholder">
                                <span class="placeholder-text">Выберите чат или создайте новый</span>
                                <div class="placeholder-dots"><span /><span /><span /></div>
                            </div>
                        }>
                            <Show when={messages().length > 0} fallback={
                                <Show when={!sending()}>
                                    <div class="empty-chat-placeholder">
                                        <span class="placeholder-text">Напишите сообщение, чтобы начать...</span>
                                        <div class="placeholder-dots"><span /><span /><span /></div>
                                    </div>
                                </Show>
                            }>
                                <For each={messages()}>
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
                                                <div innerHTML={md(msg.content)} />
                                            </Show>
                                        </div>
                                    )}
                                </For>
                            </Show>
                            <Show when={sending()}>
                                <div class="typing-indicator">
                                    <span>Думает...</span>
                                    <div class="dots"><span /><span /><span /></div>
                                </div>
                            </Show>
                        </Show>
                    </Show>
                </div>

                <Show when={selectedChatId()}>
                    <div class="compose">
                        <textarea
                            value={draft()}
                            onInput={(e) => setDraft(e.currentTarget.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Напишите сообщение..."
                        />
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            style="display:none"
                            onChange={(e) => setSelectedImage(e.currentTarget.files?.[0] ?? null)}
                        />
                        <div class="compose-actions">
                            <button class="btn-secondary" onClick={() => imageInputRef?.click()}>+ Изображение</button>
                            <Show when={selectedImage()?.name}>
                                <small>Файл: {selectedImage()?.name}</small>
                            </Show>
                            <button onClick={sendMessage}>Отправить</button>
                        </div>
                    </div>
                </Show>
            </div>
        </div>
    );
}
