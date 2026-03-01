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
}) {
    return (
      <div class="content two-col">
          <aside>
              <button onClick={props.onNewChat}>Новый чат</button>

              <For each={props.chats()}>
                  {(chat) => (
                      <button
                          class={props.activeChat()?.id === chat.id ? "active" : ""}
                          onClick={() => props.onOpenChat(chat)}>
                          <strong>{chat.name}</strong>
                          <small>{new Date(chat.createdAt).toLocaleString()}</small>
                      </button>
                  )}
              </For>
          </aside>

          <section>
              <div class="messages">
                  <For each={props.messages()}>
                      {(msg) => (
                          <div class={`bubble ${msg.type === 'USER' ? 'user': 'assistant'}`}>
                              <Show when={msg.type === 'ASSISTANT'} fallback={<span>{msg.content}</span>}>
                                  <div innerHTML={md(msg.content)}></div>
                              </Show>
                          </div>
                      )}
                  </For>
              </div>

              <div class="compose">
                  <textarea
                      value={props.draft()}
                      onInput={(e) => props.setDraft(e.currentTarget.value)}
                      placeholder="Напишите сообщение..."
                  />
                  <button onClick={props.onSend}>Отправить</button>
              </div>
          </section>
      </div>
    )
}