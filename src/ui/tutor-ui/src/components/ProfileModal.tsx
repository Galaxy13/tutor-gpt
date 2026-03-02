import type { Accessor } from "solid-js";

export default function ProfileModal(props: {
    open: Accessor<boolean>;
    onClose: () => void;

    profileContact: Accessor<string>;
    setProfileContact: (v: string) => void;
    onSaveContact: () => Promise<void>;

    passwords: Accessor<{ currentPassword: string; newPassword: string }>;
    setPassword: (fn: (p: { currentPassword: string; newPassword: string }) => { currentPassword: string; newPassword: string }) => void;
    onChangePassword: () => Promise<void>;
}) {
    return (
        <div class="modal-backdrop" style={{ display: props.open() ? 'block' : 'none' }} onClick={props.onClose}>
            <div class="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Профиль</h3>

                <div class="form">
                    <label>
                        Контакт
                        <input
                            value={props.profileContact()}
                            onInput={(e) => props.setProfileContact(e.currentTarget.value)}
                        />
                    </label>
                    <button onClick={props.onSaveContact}>Сохранить контакт</button>
                </div>

                <div style="height: 1px; background: var(--border); margin: 16px 0;" />

                <div class="form">
                    <label>
                        Текущий пароль
                        <input
                            type="password"
                            value={props.passwords().currentPassword}
                            onInput={(e) => props.setPassword((p) => ({ ...p, currentPassword: e.currentTarget.value }))}
                        />
                    </label>

                    <label>
                        Новый пароль
                        <input
                            type="password"
                            value={props.passwords().newPassword}
                            onInput={(e) => props.setPassword((p) => ({ ...p, newPassword: e.currentTarget.value }))}
                        />
                    </label>

                    <button onClick={props.onChangePassword}>Изменить пароль</button>
                </div>
            </div>
        </div>
    );
}
