create table if not exists users (
    id uuid primary key not null default gen_random_uuid(),
    name varchar(50) not null,
    surname varchar(100) not null,
    username varchar(100) not null unique,
    role varchar(20) not null default 'USER',
    password_hash varchar(255) not null,
    is_active bool not null,
    contact VARCHAR(150)
);

create table if not exists prompts (
    id bigserial primary key not null,
    content jsonb not null
);

create table if not exists chats (
    id uuid primary key not null default gen_random_uuid(),
    name VARCHAR(100) not null,
    created_at timestamp not null default now(),
    user_id uuid not null references users(id),
    prompt_id bigint references prompts(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid primary key not null default gen_random_uuid(),
    conversation_id uuid references chats(id),
    content TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL')),
    "timestamp" TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS chat_messages_conversation_id_idx
    ON chat_messages(conversation_id, "timestamp");

CREATE INDEX IF NOT EXISTS idx_chat_memory_user_id ON chats(user_id);