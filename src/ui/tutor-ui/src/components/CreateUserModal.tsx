import { Show } from "solid-js";
import {UserForm} from "../types";

export default function CreateUserModal(props: {
    open: boolean,
    draft: () => UserForm,
    setDraft: (fn: (prev: UserForm) => UserForm) => void,
    onClose: () => void,
    onSubmit: () => void,
}) {
    return (
        <Show when={props.open}>
            <div class="modal-backdrop" onClick={props.onClose}/>
            <div class="modal">
                <h3>Создать пользователя</h3>

                <div class="form">
                    <label>
                        Ник
                        <input
                            value={props.draft().username}
                            onInput={(e) =>
                                props.setDraft((p) => ({...p, username: e.currentTarget.value}))}
                        />
                    </label>

                    <label>
                        Имя
                        <input
                            value={props.draft().name}
                            onInput={(e) =>
                                props.setDraft((p) => ({...p, name: e.currentTarget.value}))
                            }
                        />
                    </label>

                    <label>
                        Фамилия
                        <input
                            value={props.draft().surname}
                            onInput={(e) =>
                                props.setDraft((p) => ({...p, surname: e.currentTarget.value}))
                            }
                        />
                    </label>

                    <label>
                        Контакт
                        <input
                            value={props.draft().contact}
                            onInput={(e) =>
                                props.setDraft((p) => ({...p, contact: e.currentTarget.value}))
                            }
                        />
                    </label>

                    <label>
                        Роль
                        <select
                            value={props.draft().role}
                            onChange={(e) =>
                                props.setDraft((p) => ({
                                    ...p,
                                    role: e.currentTarget.value as UserForm["role"],
                                }))
                            }
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </label>

                    <label>
                        Пароль
                        <input
                            type="password"
                            value={props.draft().password}
                            onInput={(e) =>
                                props.setDraft((p) => ({...p, password: e.currentTarget.value}))
                            }
                        />
                    </label>

                    <label class="row">
                        <input
                            type="checkbox"
                            checked={props.draft().isActive}
                            onChange={(e) =>
                                props.setDraft((p) => ({...p, isActive: e.currentTarget.checked}))
                            }
                        />
                        Активен
                    </label>

                    <div class="row actions">
                        <button onClick={props.onClose}>Отмена</button>
                        <button onClick={props.onSubmit}>Создать</button>
                    </div>
                </div>
            </div>
        </Show>
    );
}