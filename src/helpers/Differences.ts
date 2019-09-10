import Query, { IQuery } from "./Query";
import { IWorkItem } from "./WorkItem";
import store from "../store";
import Loaders from "./Loaders";
import Electron from "./Electron";

export default class Differences {
    public static clearWiStorage() {
        (window as any).wiStorage = undefined;
    }

    public static put(query: IQuery, workItems: IWorkItem[]) {
        let wiStorage = Query.getWIStorage();

        //clear unused and ignored queries
        let allQueriesIds = store
            .getQueries()
            .filter(q => !q.ignoreNotif)
            .map(q => q.queryId);

        for (let x in wiStorage) {
            if (!allQueriesIds.includes(x)) wiStorage[x] = undefined;
        }

        if (Loaders.outage) {
            (wiStorage as any) = undefined;
            Loaders.outage = false;
            return;
        }

        if (!wiStorage[query.queryId]) {
            wiStorage[query.queryId] = store.copy(workItems);
            return;
        }

        let storage = wiStorage[query.queryId];
        let news: IWorkItem[] = [];
        let changed: IWorkItem[] = [];

        workItems.forEach(wi => {
            if (!storage) return;
            let stored = this.getWIById(storage, wi.id);
            if (!stored) {
                store.setWIHasChanges(wi, true);
                news.push(wi);
                return;
            }
            if (stored.rev !== wi.rev) {
                store.setWIHasChanges(wi, true);
                changed.push(wi);
            }
        });

        console.log("news", news.length, "changed", changed.length);

        news.forEach(n => {
            if (
                store.settings.notificationsMode === "all" ||
                (store.settings.notificationsMode === "mine" && n.assignedToFull.toLowerCase().indexOf(store.settings.tfsUser.toLowerCase()) !== -1)
            ) {
                this.showNotif(this.createTitleForWI(n), "new");
            }
        });

        changed.forEach(c => {
            if (
                store.settings.notificationsMode === "all" ||
                (store.settings.notificationsMode === "mine" && c.assignedToFull.toLowerCase().indexOf(store.settings.tfsUser.toLowerCase()) !== -1)
            ) {
                this.showNotif(this.createTitleForWI(c), "change");
            }
        });

        wiStorage[query.queryId] = store.copy(workItems);
    }

    private static createTitleForWI(wi: IWorkItem) {
        let text = wi.title;
        let id = wi.id;
        let promptness = wi.promptness && wi.promptness < 3 ? `(${wi.promptnessText})` : "";
        let rank = wi.rank && wi.rank === 1 ? `(Rank 1)` : "";
        return `${promptness}${rank} ${id}: ${text}`;
    }

    private static getWIById(storage: IWorkItem[], id: number) {
        return storage.find(wi => wi.id === id);
    }

    private static showNotif(text: string, reason?: "new" | "change") {
        let title = "Flowerpot";
        if (reason) {
            if (reason === "new") title += ": new item";
            if (reason === "change") title += ": item changed";
        }
        Electron.showNativeNotif({ title: title, body: text });
    }
}
