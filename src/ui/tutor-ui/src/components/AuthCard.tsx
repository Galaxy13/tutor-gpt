import type { Accessor } from "solid-js";

export default function AuthCard(props: {
    login: Accessor<{username: string, password: string}>,
    setLogin: (fn: (p: { username: string, password: string }) => { username: string, password: string }) => void,
    error: Accessor<string>,
    onLogin: () => void,
}) {
    return (
        <div class="auth-card">
            <h1>Tutor GPT</h1>

            <input
                placeholder="Username"
                value={props.login().username}
                onInput={(e) => props.setLogin((p) => ({ ...p, username: e.currentTarget.value }))}
            />

            <input
                placeholder="Password"
                value={props.login().password}
                onInput={(e) => props.setLogin((p) => ({ ...p, password: e.currentTarget.value }))}
            />

            <button onClick={props.onLogin}>Login</button>

            {props.error() && <p class="error">{props.error()}</p> }
        </div>
    );
}