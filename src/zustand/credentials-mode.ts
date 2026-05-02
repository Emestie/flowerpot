import { create } from "zustand";
import { createLogger } from "./logger";

export interface CredentialsModeStore {
    selectedAccoundId: string | null;
    setSelectedAccountId: (id: string | null) => void;
}

export const useCredentialsModeStore = create<CredentialsModeStore>()(
    createLogger("useCredentialsModeStore", "#d35400", (set, get) => {
        return {
            selectedAccoundId: null,
            setSelectedAccountId(id) {
                set({ selectedAccoundId: id });
            },
        };
    })
);
