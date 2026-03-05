import { nanoid } from "nanoid";
import { createStore } from "solid-js/store"

import { ToastObject, ToastType} from "./types";

const [toastStore, updateToastStore] = createStore({
    toasts: [] as ToastObject[]
})

const addToast = (type: ToastType, message: string) => {
    const toastId = nanoid();
    updateToastStore("toasts", (t) => [{
        toastId,
        message,
        type,
    }, ...t])
    setTimeout(() => {
        updateToastStore("toasts", (t) =>
            t.filter(toast => toast.toastId !== toastId))
    }, 5000)
}

const removeToast = (toastId: string) => {
    updateToastStore("toasts", (t) => t.filter((i) => i.toastId !== toastId));
}

export default {
    toastStore,
    addToast,
    removeToast
}

