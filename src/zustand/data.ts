import { create } from "zustand";
import Platform from "../helpers/Platform";
import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { PullRequest } from "../models/pull-request";
import { createLogger } from "./logger";

export interface DataStore {
    workItems: WorkItem[];
    changesCollection: Record<string, boolean | undefined>;
    prChangesCollection: Record<string, boolean | undefined>;
    setChangesCollection: (changesCollection: Record<string, boolean | undefined>) => void;
    setChangesCollectionItem: (workItem: WorkItem, hasChanges: boolean) => void;
    clearChangesCollection: () => void;
    setPrChangesCollectionItem: (pr: PullRequest, hasChanges: boolean) => void;
    clearPrChangesCollection: () => void;
    setWorkItemsForQuery: (query: Query, items: WorkItem[]) => void;
    getWorkItemsForQuery: (query: Query) => WorkItem[];
}

export const useDataStore = create<DataStore>()(
    createLogger("useDataStore", "#e67e22", (set, get) => {
        return {
            workItems: [],
            changesCollection: {},
            prChangesCollection: {},

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

            setPrChangesCollectionItem(pr, hasChanges) {
                const prChangesCollection = { ...get().prChangesCollection };
                prChangesCollection[pr.id] = hasChanges ? true : undefined;
                localStorage.setItem("PRChangesCollection", JSON.stringify(prChangesCollection));
                set({ prChangesCollection });
            },

            clearPrChangesCollection() {
                localStorage.setItem("PRChangesCollection", JSON.stringify({}));
                set({ prChangesCollection: {} });
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
