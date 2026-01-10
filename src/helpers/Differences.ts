import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { dataChangesCollectionItemSet } from "../redux/actions/dataActions";
import { getQueriesSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";
import { s } from "../values/Strings";
import Platform from "./Platform";
import QueryHelper from "./Query";

interface IShownWI {
    id: number;
    rev: number;
}

export default class Differences {
    private static shownWI: IShownWI[] = [];

    public static put(query: Query, workItems: WorkItem[]) {
        let wiStorage = QueryHelper.getWIStorage();

        //clear unused and ignored queries
        let allQueriesIds = getQueriesSelector()(store.getState())
            .filter((q) => !q.ignoreNotif)
            .map((q) => q.queryId);

        for (let x in wiStorage) {
            if (!allQueriesIds.includes(x)) wiStorage[x] = undefined;
        }

        // if (Loaders.outage) {
        //     (wiStorage as any) = undefined;
        //     Loaders.outage = false;
        //     return;
        // }
        //TODO:

        if (!wiStorage[query.queryId]) {
            wiStorage[query.queryId] = [...workItems];
            QueryHelper.saveWIStorage(wiStorage);
            return;
        }

        let storage = wiStorage[query.queryId];
        let news: WorkItem[] = [];
        let changed: WorkItem[] = [];

        workItems.forEach((wi) => {
            if (!storage) return;
            let stored = this.getWIById(storage, wi.id);
            if (!stored) {
                store.dispatch(dataChangesCollectionItemSet(wi, true));
                //store.setWIHasChanges(wi, true);
                news.push(wi);
                return;
            }
            if (stored.rev !== wi.rev) {
                store.dispatch(dataChangesCollectionItemSet(wi, true));
                //store.setWIHasChanges(wi, true);
                changed.push(wi);
            }
        });

        console.log("New WIs", news.length, "Changed WIs", changed.length);

        //dont show same notifs twice
        news = news.filter((wi) => !this.shownWI.find((x) => x.id === wi.id && x.rev === wi.rev));
        changed = changed.filter((wi) => !this.shownWI.find((x) => x.id === wi.id && x.rev === wi.rev));
        this.shownWI.push(
            ...news.map((wi) => ({ id: wi.id, rev: wi.rev })),
            ...changed.map((wi) => ({ id: wi.id, rev: wi.rev }))
        );

        this.operateNotifsToShow(news, "new");
        this.operateNotifsToShow(changed, "change");

        wiStorage[query.queryId] = [...workItems];
        QueryHelper.saveWIStorage(wiStorage);
    }

    private static operateNotifsToShow(wis: WorkItem[], type: "new" | "change") {
        const wisToShow: WorkItem[] = [];
        const settings = store.getState().settings;

        wis.forEach((n) => {
            if (settings.notificationsMode === "all" || (settings.notificationsMode === "mine" && n._isMine)) {
                wisToShow.push(n);
            }
        });

        if (wisToShow.length < 2) {
            wisToShow.forEach((nts) => this.showNotif(this.createTextForWI(nts), type));
        } else {
            const count = wisToShow.length;
            this.showNotif(count + (type === "new" ? s("itemsNew") : s("itemsWasChanged")), type);
        }
    }

    private static createTextForWI(wi: WorkItem) {
        const text = wi.title;
        const id = wi.id;
        const priorityWarn = wi.priority && wi.priority < 2 ? `(${wi.priorityText}) ` : "";
        return `${priorityWarn}${id}: ${text}`;
    }

    private static getWIById(storage: WorkItem[], id: number) {
        return storage.find((wi) => wi.id === id);
    }

    private static showNotif(text: string, reason?: "new" | "change") {
        let title = "Flowerpot";
        if (reason) {
            if (reason === "new") title += s("notifNewItem");
            if (reason === "change") title += s("notifChangedItem");
        }
        Platform.current.showNativeNotif({ title: title, body: text });
    }

    public static isChangesCollectionHasChanges(changesCollection: any) {
        return !!Object.values(changesCollection || {}).filter((x) => !!x).length;
    }
}
