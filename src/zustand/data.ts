import { create } from "zustand";
import Platform from "../helpers/Platform";
import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { createLogger } from "./logger";

export interface DataStore {
    workItems: WorkItem[];
    changesCollection: Record<string, boolean | undefined>;
    setChangesCollection: (changesCollection: Record<string, boolean | undefined>) => void;
    setChangesCollectionItem: (workItem: WorkItem, hasChanges: boolean) => void;
    clearChangesCollection: () => void;
    setWorkItemsForQuery: (query: Query, items: WorkItem[]) => void;
    getWorkItemsForQuery: (query: Query) => WorkItem[];
}

export const useDataStore = create<DataStore>()(
    createLogger("useDataStore", (set, get) => {
        return {
            workItems: [],
            changesCollection: {},

            setChangesCollection(changesCollection) {
                Platform.current.updateTrayIconDot(!!Object.values(changesCollection || {}).filter((x) => !!x).length);
                set({ changesCollection });
            },

            setChangesCollectionItem(workItem, hasChanges) {
                const changesCollection = { ...get().changesCollection };
                changesCollection[workItem.id] = hasChanges ? true : undefined;
                localStorage.setItem("WIChangesCollection", JSON.stringify(changesCollection));
                Platform.current.updateTrayIconDot(!!Object.values(changesCollection || {}).filter((x) => !!x).length);
                set({ changesCollection });
            },

            clearChangesCollection() {
                localStorage.setItem("WIChangesCollection", JSON.stringify({}));
                Platform.current.updateTrayIconDot(false);
                set({ changesCollection: {} });
            },

            setWorkItemsForQuery(query, items) {
                const workItems = get().workItems.filter((wi) => wi._queryId !== query.queryId);
                set({ workItems: [...workItems, ...items] });
            },

            getWorkItemsForQuery(query) {
                return get().workItems.filter((wi) => wi._queryId === query.queryId);
            },
        };
    })
);

export const dataStore = {
    get workItems() {
        return useDataStore.getState().workItems;
    },
    get changesCollection() {
        return useDataStore.getState().changesCollection;
    },
};
