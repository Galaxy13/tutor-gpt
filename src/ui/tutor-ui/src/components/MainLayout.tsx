import type { JSX } from "solid-js";
import type { AuthResponse } from "../types";

export default function MainLayout(props: {
    auth: AuthResponse;
    onOpenProfile: () => void;
    onLogout: () => void;
    children: JSX.Element;
}) {
    const initials = () => {
        const n = props.auth.user.name?.[0] ?? "";
        const s = props.auth.user.surname?.[0] ?? "";
        return (n + s).toUpperCase();
    };

    return (
        <div class="layout">
            <header>
                <div class="user-info">
                    <div class="avatar">{initials()}</div>
                    <div>
                        <div class="user-name">{props.auth.user.name} {props.auth.user.surname}</div>
                        <div class="user-role">{props.auth.user.role}</div>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn-secondary" onClick={props.onOpenProfile}>Профиль</button>
                    <button class="btn-ghost" onClick={props.onLogout}>Выйти</button>
                </div>
            </header>
            {props.children}
        </div>
    );
}
