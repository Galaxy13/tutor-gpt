import type { Accessor } from "solid-js";

export default function AuthCard(props: {
    login: Accessor<{username: string, password: string}>,
    setLogin: (fn: (p: { username: string, password: string }) => { username: string, password: string }) => void,
    error: Accessor<string>,
    onLogin: () => void,
}) {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") props.onLogin();
    };

    return (
        <div class="auth-wrapper">
            <div class="auth-card">
                <h1>Tutor GPT</h1>
                <p class="subtitle">Войдите в систему</p>

                <input
                    placeholder="Имя пользователя"
                    value={props.login().username}
                    onInput={(e) => props.setLogin((p) => ({ ...p, username: e.currentTarget.value }))}
                    onKeyDown={handleKeyDown}
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={props.login().password}
                    onInput={(e) => props.setLogin((p) => ({ ...p, password: e.currentTarget.value }))}
                    onKeyDown={handleKeyDown}
                />

                <button onClick={props.onLogin}>Войти</button>

                {props.error() && <p class="error">{props.error()}</p>}
            </div>
        </div>
    );
}
