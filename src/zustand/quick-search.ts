import { create } from "zustand";
import { createLogger } from "./logger";

export interface QuickSearchStore {
    value: string;
    setValue: (value: string) => void;
}

export const useQuickSearchStore = create<QuickSearchStore>()(
    createLogger("useQuickSearchStore", (set, get) => {
        return {
            value: "",
            setValue(value) {
                if (get().value !== value) set({ value });
            },
        };
    })
);
