import Query, { IQuery } from "./Query";
import { IWorkItem } from "./WorkItem";
import store from "../store";
import Loaders from "./Loaders";
import Electron from "./Electron";
import { s } from "../values/Strings";

interface IShownWI {
    id: number;
    rev: number;
}

export default class Differences {
    private static shownWI: IShownWI[] = [];

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

        console.log("New WIs", news.length, "Changed WIs", changed.length);

        //dont show same notifs twice
        news = news.filter(wi => !this.shownWI.find(x => (x.id === wi.id && x.rev === wi.rev)));
        changed = changed.filter(wi => !this.shownWI.find(x => (x.id === wi.id && x.rev === wi.rev)));
        this.shownWI.push(...news.map(wi => ({ id: wi.id, rev: wi.rev })), ...changed.map(wi => ({ id: wi.id, rev: wi.rev })));

        news.forEach(n => {
            if (
                store.settings.notificationsMode === "all" ||
                (store.settings.notificationsMode === "mine" &&
                    n.assignedToFull.toLowerCase().indexOf(store.settings.tfsUser.toLowerCase()) !== -1)
            ) {
                this.showNotif(this.createTextForWI(n), "new");
            }
        });

        changed.forEach(c => {
            if (
                store.settings.notificationsMode === "all" ||
                (store.settings.notificationsMode === "mine" &&
                    c.assignedToFull.toLowerCase().indexOf(store.settings.tfsUser.toLowerCase()) !== -1)
            ) {
                this.showNotif(this.createTextForWI(c), "change");
            }
        });

        wiStorage[query.queryId] = store.copy(workItems);
    }

    private static createTextForWI(wi: IWorkItem) {
        let text = wi.title;
        let id = wi.id;
        let promptness = wi.promptness && wi.promptness < 3 ? `(${wi.promptnessText})` : "";
        let rank = wi.rank && wi.rank === 1 ? `(Rank 1)` : "";
        return `${promptness}${rank} [${wi.rev}] ${id}: ${text}`;
    }

    private static getWIById(storage: IWorkItem[], id: number) {
        return storage.find(wi => wi.id === id);
    }

    private static showNotif(text: string, reason?: "new" | "change") {
        let title = "Flowerpot";
        if (reason) {
            if (reason === "new") title += s("notifNewItem");
            if (reason === "change") title += s("notifChangedItem");
        }
        Electron.showNativeNotif({ title: title, body: text });
    }
}
