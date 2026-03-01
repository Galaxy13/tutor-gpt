import type { Accessor } from "solid-js";

export default function ProfileModal(props: {
    open: Accessor<boolean>;
    onClose: () => void;

    profileContact: Accessor<string>;
    setProfileContact: (v: string) => void;
    onSaveContact: () => Promise<void>;

    passwords: Accessor<{currentPassword: string; newPassword: string}>;
    setPassword: (fn: (p: { currentPassword: string; newPassword: string }) => { currentPassword: string; newPassword: string }) => void;
    onChangePassword: () => Promise<void>;
}) {
    return (
        <div class="modal-backdrop" style={{display: props.open() ? 'grid' : 'none'}} onClick={props.onClose}>
            <div class="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Профиль</h3>

                <label>Контакт</label>
                <input value={props.profileContact()} onInput={(e) => props.setProfileContact(e.target.value)} />
                <button onClick={props.onSaveContact}>Сохранить</button>

                <hr />

                <label>Текущий пароль</label>
                <input
                    type="password"
                    value={props.passwords().currentPassword}
                    onInput={(e) => props.setPassword((p) => ({...p, currentPassword: e.currentTarget.value}))}
                />

                <label>Новый пароль</label>
                <input
                    type="password"
                    value={props.passwords().newPassword}
                    onInput={(e) => props.setPassword((p) => ({...p, newPassword: e.currentTarget.value}))}
                />

                <button onClick={props.onChangePassword}>Изменить пароль</button>
            </div>
        </div>
    );
}