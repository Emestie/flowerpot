import { create } from "zustand";

export interface CredentialsModeStore {
    selectedAccoundId: string | null;
    setSelectedAccountId: (id: string | null) => void;
}

export const useCredentialsModeStore = create<CredentialsModeStore>()((set, get) => {
    return {
        selectedAccoundId: null,
        setSelectedAccountId(id) {
            set({ selectedAccoundId: id });
        },
    };
});
