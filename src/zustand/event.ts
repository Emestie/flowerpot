import { create } from "zustand";

export interface EventStore {
    collapseCounter: number;
    expandCounter: number;
    collapseAll: () => void;
    expandAll: () => void;
}

export const useEventStore = create<EventStore>()((set, get) => {
    return {
        collapseCounter: 0,
        expandCounter: 0,
        collapseAll() {
            set((state) => ({ collapseCounter: state.collapseCounter + 1 }));
        },
        expandAll() {
            set((state) => ({ expandCounter: state.expandCounter + 1 }));
        },
    };
});
