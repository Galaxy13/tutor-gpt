import type { AuthResponse, Chat, Message, Prompt, User, UserForm } from "./types";

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080/api/v1';

export async function api<T>(path: string, method = 'GET', body?: unknown, token?: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) throw new Error(await response.text());
    if (response.status === 204) return undefined as T;
    return await response.json() as Promise<T>;
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
};

export const AdminApi = {
    users: (token: string) =>
        api<User[]>('/admin/users', 'GET', undefined, token),
    chats: (token: string) => api<Chat[]>('/admin/chats', 'GET', undefined, token),
    prompts: (token: string) => api<Prompt[]>('/admin/prompt', 'GET', undefined, token),

    createUser: (payload: UserForm, token: string) =>
        api<User>("/admin/users", "POST", payload, token),
    deleteUser: (id: string, token: string) => api<void>(`/admin/users/${id}`, 'DELETE', undefined, token),

    createPrompt: (content: Record<string, string>, token: string) =>
        api<void>('/admin/prompt', 'POST', { content }, token),

    chatMessages: (chatId: string, token: string) =>
        api<Message[]>(`/admin/chats/messages/${chatId}`, 'GET', undefined, token),

    createChatWithoutPrompt: (payload: {message: string, name: string}, token: string) =>
        api<Chat>('/admin/chats', 'POST', payload, token),

    sendChatWithoutPrompt: (chatId: string, message: string, token: string) =>
        api<Message>(`/admin/chats/messages/${chatId}`, 'POST', { message }, token),
}

