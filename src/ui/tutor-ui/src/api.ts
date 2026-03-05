import type { AuthResponse, Chat, Message, Prompt, User, UserForm } from "./types";

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080/api/v1';
export const API_ORIGIN = new URL(API_BASE).origin;

export async function api<T>(path: string, method = 'GET', body?: unknown, token?: string): Promise<T> {
    const isFormData = body instanceof FormData;
    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? (isFormData ? body as FormData : JSON.stringify(body)) : undefined,
    });

    if (!response.ok) throw new Error(await response.text())
    if (response.status === 204) return undefined as T;
    return await response.json() as Promise<T>;
}

export async function fetchImageBlobUrl(imageUrl: string, token: string): Promise<string> {
    const response = await fetch(`${API_ORIGIN}${imageUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return '';
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

export async function resolveMessageImageUrls(messages: Message[], token: string): Promise<Message[]> {
    return Promise.all(
        messages.map(async (msg) => {
            if (msg.imageUrl && msg.imageUrl.startsWith('/api/v1/files/')) {
                const blobUrl = await fetchImageBlobUrl(msg.imageUrl, token);
                return { ...msg, imageUrl: blobUrl || msg.imageUrl };
            }
            return msg;
        })
    );
}

export const AuthApi = {
    login: (payload: {username: string; password: string}) =>
        api<AuthResponse>('/auth/login', 'POST', payload)
};

export const UserApi = {
    mePatch: (payload: { contact: string }, token: string) =>
        api<User>('/user/me', 'PATCH', payload, token),

    changePassword: (payload: {currentPassword: string; newPassword: string}, token: string) =>
        api<void>('/user/me/password', 'POST', payload, token),
};

export const ChatApi = {
    listMine: (token: string) => api<Chat[]>('/chat_info', 'GET', undefined, token),
    createMine: (payload: {message: string, name?: string}, token: string) =>
        api<Chat>('/chat_info', 'POST', payload, token),
    messagesMine: (chatId: string, token: string) =>
        api<Message[]>(`/chat_info/messages/${chatId}`, 'GET', undefined, token),
    sendMessage: (chatId: string, message: string, token: string) =>
        api<Message>(`/message/${chatId}`, 'POST', { message }, token),

    sendMessageWithImage: (chatId: string, message: string, image: File, token: string, withPrompt: boolean) => {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('request', new Blob([JSON.stringify({ message })], { type: 'application/json' }));

        return api<Message>(`/message/image/${chatId}?withPrompt=${withPrompt}`, 'POST', formData, token);
    },
};

export const AdminApi = {
    users: (token: string) =>
        api<User[]>('/admin/users', 'GET', undefined, token),
    chats: (token: string) => api<Chat[]>('/admin/chats', 'GET', undefined, token),
    prompts: (token: string) => api<Prompt[]>('/admin/prompt', 'GET', undefined, token),

    createUser: (payload: UserForm, token: string) =>
        api<User>("/admin/users", "POST", payload, token),
    updateUser: (id: string, payload: Omit<UserForm, 'password'>, token: string) =>
        api<User>(`/admin/users/${id}`, 'PATCH', payload, token),
    resetPassword: (id: string, password: string, token: string) =>
        api<void>(`/admin/users/${id}/reset_password`, 'POST', { password }, token),
    deleteUser: (id: string, token: string) => api<void>(`/admin/users/${id}`, 'DELETE', undefined, token),

    createPrompt: (content: Record<string, string>, token: string) =>
        api<void>('/admin/prompt', 'POST', { content }, token),

    userChats: (userId: string, token: string) =>
        api<Chat[]>(`/admin/chats/${userId}`, 'GET', undefined, token),
    chatMessages: (chatId: string, token: string) =>
        api<Message[]>(`/admin/chats/messages/${chatId}`, 'GET', undefined, token),

    createChat: (payload: {message: string, name: string}, token: string, withPrompt = true) =>
        api<Chat>(`/admin/chats?withPrompt=${withPrompt}`, 'POST', payload, token),

    sendMessage: (chatId: string, message: string, token: string, withPrompt = true) =>
        api<Message>(`/admin/chats/messages/${chatId}?withPrompt=${withPrompt}`, 'POST', { message }, token),

    sendMessageWithImage: (chatId: string, message: string, image: File, token: string, withPrompt = true) => {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('request', new Blob([JSON.stringify({ message })], { type: 'application/json' }));

        return api<Message>(`/admin/chats/messages/image/${chatId}?withPrompt=${withPrompt}`, 'POST', formData, token);
    },
};
