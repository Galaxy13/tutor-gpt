export type Role = 'USER' | 'ADMIN';

export type User = {
    id: string;
    name: string;
    surname: string;
    contact?: string;
    role: Role;
};

export type AuthResponse = {
    token: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
};

export type Chat = {
    id: string;
    name: string;
    createdAt: string;
    promptVersion?: string;
};

export type TempChat = {
    id: string;
    name: string;
    createdAt: string;
    __temp: true;
}

export type AnyChat = Chat | TempChat;

export type Message = {
    content: string;
    type: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
    chatId: string;
    timestamp: string;
};

export type Prompt = {
    version: number;
    content: Record<string, string>
}

export type UserForm = {
    username: string;
    name: string;
    surname: string;
    role: Role;
    contact: string;
    password: string;
    isActive: boolean;
};

export type AdminTab = 'users' | 'chats' | 'prompts' | 'admin_chat' | 'promptless_chat'