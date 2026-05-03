import { create } from "zustand";
import { IFestivalDescriptor } from "../helpers/Festival";
import { TDialog, TLocale, TUpdateStatus, TView } from "../types";
import { createLogger } from "./logger";

export interface AppState<IVP = Record<string, any>> {
    view: TView;
    viewParams: IVP;
    updateStatus: TUpdateStatus;
    dialogs: Record<string, boolean>;
    currentFestival: IFestivalDescriptor | undefined;
    showWhatsNew: boolean;
    autostart: boolean;
    locale: TLocale;
    showMineOnly: boolean;
    setView: (view: TView, viewParams?: Record<string, any>) => void;
    setError: (message: string) => void;
    setShowWhatsNew: (showWhatsNew: boolean) => void;
    setSettings: (fields: Partial<AppState>) => void;
    setCurrentFestival: (currentFestival: IFestivalDescriptor | undefined) => void;
    setUpdateStatus: (updateStatus: TUpdateStatus) => void;
    setDialog: (dialogKey: TDialog, value: boolean) => void;
    setShowMineOnly: (showMineOnly: boolean) => void;
}

export const useAppStore = create<AppState>()(
    createLogger("useAppStore", "#4a90d9", (set, get) => ({
        view: "loading",
        viewParams: {},
        updateStatus: "none",
        dialogs: {},
        currentFestival: undefined,
        showWhatsNew: false,
        autostart: true,
        locale: "en",
        showMineOnly: false,

        setView(view, viewParams = {}) {
            set({ view, viewParams });
        },

        setError(message) {
            set({ view: "error", viewParams: { errorMessage: message } });
        },

        setShowWhatsNew(showWhatsNew) {
            set({ showWhatsNew });
        },

        setSettings(fields) {
            set(fields);
        },

        setCurrentFestival(currentFestival) {
            set({ currentFestival });
        },

        setUpdateStatus(updateStatus) {
            set({ updateStatus });
        },

        setDialog(dialogKey, value) {
            const dialogs = { ...get().dialogs, [dialogKey]: value };
            set({ dialogs });
        },

        setShowMineOnly(showMineOnly) {
            set({ showMineOnly });
        },
    }))
);
