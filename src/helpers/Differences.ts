import { dataChangesCollectionItemSet } from "../redux/actions/dataActions";
import { getQueriesSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";
import { s } from "../values/Strings";
import Platform from "./Platform";
import Query, { IQuery } from "./Query";
import { Stats, UsageStat } from "./Stats";
import { IWorkItem } from "./WorkItem";

interface IShownWI {
    id: number;
    rev: number;
}

export default class Differences {
    private static shownWI: IShownWI[] = [];

    public static put(query: IQuery, workItems: IWorkItem[]) {
        let wiStorage = Query.getWIStorage();

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
            Query.saveWIStorage(wiStorage);
            return;
        }

        let storage = wiStorage[query.queryId];
        let news: IWorkItem[] = [];
        let changed: IWorkItem[] = [];

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
            ...changed.map((wi) => ({ id: wi.id, rev: wi.rev })),
        );

        this.operateNotifsToShow(news, "new");
        this.operateNotifsToShow(changed, "change");

        if (news.length) Stats.incrementBy(UsageStat.WorkItemsArrived, news.length);

        wiStorage[query.queryId] = [...workItems];
        Query.saveWIStorage(wiStorage);
    }

    private static operateNotifsToShow(wis: IWorkItem[], type: "new" | "change") {
        const wisToShow: IWorkItem[] = [];
        const settings = store.getState().settings;

        wis.forEach((n) => {
            if (
                settings.notificationsMode === "all" ||
                (settings.notificationsMode === "mine" &&
                    n.assignedToFull.toLowerCase().indexOf(settings.tfsUser.toLowerCase()) !== -1)
            ) {
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

    private static createTextForWI(wi: IWorkItem) {
        let text = wi.title;
        let id = wi.id;
        let promptness = wi.promptness && wi.promptness < 3 ? `(${wi.promptnessText})` : "";
        let rank = wi.rank && wi.rank === 1 ? `(Rank 1)` : "";
        return `${promptness}${rank} ${id}: ${text}`;
    }

    private static getWIById(storage: IWorkItem[], id: number) {
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
