export type Role = 'USER' | 'ADMIN';

export type User = {
    id: string;
    username?: string;
    name: string;
    surname: string;
    contact?: string;
    role: Role;
    isActive?: boolean;
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
    username: string;
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
    imageUrl?: string;
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

export type AdminTab = 'users' | 'chats' | 'my_chats' | 'prompts' | 'user_chats';
