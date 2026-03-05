import { For } from "solid-js";
import store from "../store";
import { ToastObject, ToastType } from "../types";

const Toast = () => {
    return (
        <div class="toast-container">
            <For each={store.toastStore.toasts}>
                {(toast: ToastObject) => (
                    <div class="toast" className={toast.type}>
                        <i
                            class="icon"
                            classList={{
                                "icon-check-circle": toast.type === ToastType.Success,
                                "icon-x-circle": toast.type === ToastType.Error,
                                "icon-alert-circle": toast.type === ToastType.Warning,
                                "icon-info": toast.type === ToastType.Info,
                            }}
                        ></i>
                        <span>{toast.message}</span>
                        <button onClick={() => store.removeToast(toast.toastId)}>X</button>
                    </div>
                )}
            </For>
        </div>
    );
};

export default Toast