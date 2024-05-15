import { create } from "zustand";

export interface QuickSearchStore {
    value: string;
    setValue: (value: string) => void;
}

export const useQuickSearchStore = create<QuickSearchStore>()((set, get) => {
    return {
        value: "",
        setValue(value) {
            if (get().value !== value) set({ value });
        },
    };
});
