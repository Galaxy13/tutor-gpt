import type { JSX } from "solid-js";
import type { AuthResponse } from "../types";

export default function MainLayout(props: {
    auth: AuthResponse;
    onOpenProfile: () => void;
    onLogout: () => void;
    children: JSX.Element;
}) {
    return (
        <div class="layout">
            <header>
                <div>
                    {props.auth.user.name} {props.auth.user.surname} ({(props.auth.user.role)})
                </div>
                <div class="row">
                    <button onClick={props.onOpenProfile}>Профиль</button>
                    <button onClick={props.onLogout}>Выйти из профиля</button>
                </div>
            </header>
            {props.children}
        </div>
    );
}