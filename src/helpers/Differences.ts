import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { PullRequest } from "../models/pull-request";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import { s } from "../values/Strings";
import Platform from "./Platform";
import QueryHelper from "./Query";
import Lists from "./Lists";

interface IShownWI {
    id: number;
    rev: number;
}

interface IShownPR {
    id: number;
    commitId: string;
}

export default class Differences {
    private static shownWI: IShownWI[] = [];
    private static shownPR: IShownPR[] = [];

    public static put(query: Query, workItems: WorkItem[]) {
        let wiStorage = QueryHelper.getWIStorage();

        //clear unused and ignored queries
        let allQueriesIds = (useSettingsStore.getState().queries || [])
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
                useDataStore.getState().setChangesCollectionItem(wi, true);
                news.push(wi);
                return;
            }
            if (stored.rev !== wi.rev) {
                useDataStore.getState().setChangesCollectionItem(wi, true);
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

    public static putPRs(accountId: string, pullRequests: PullRequest[]) {
        if (!useSettingsStore.getState().prNotificationsEnabled) return;

        let prStorage = QueryHelper.getPRStorage();

        if (!prStorage[accountId]) {
            prStorage[accountId] = [...pullRequests];
            QueryHelper.savePRStorage(prStorage);
            return;
        }

        let storage = prStorage[accountId];
        let news: PullRequest[] = [];
        let changed: PullRequest[] = [];

        pullRequests.forEach((pr) => {
            if (!storage) return;
            let stored = this.getPRById(storage, pr.id);
            if (!stored) {
                news.push(pr);
                return;
            }
            if (stored.commitId !== pr.commitId) {
                changed.push(pr);
            }
        });

        console.log("New PRs", news.length, "Changed PRs", changed.length);

        //unhide PRs that have changes
        changed.forEach((pr) => {
            if (Lists.isPrHidden(pr.accountId, pr.collectionName, pr.id)) {
                const hiddenPrs = useSettingsStore.getState().hiddenPrs;
                const updatedHiddenPrs = hiddenPrs.filter(
                    (x) => !(x.accountId === pr.accountId && x.collection === pr.collectionName && x.id === pr.id)
                );
                useSettingsStore.getState().setHiddenPrs(updatedHiddenPrs);
            }
        });

        //dont show same notifs twice
        news = news.filter((pr) => !this.shownPR.find((x) => x.id === pr.id && x.commitId === pr.commitId));
        changed = changed.filter((pr) => !this.shownPR.find((x) => x.id === pr.id && x.commitId === pr.commitId));
        this.shownPR.push(
            ...news.map((pr) => ({ id: pr.id, commitId: pr.commitId })),
            ...changed.map((pr) => ({ id: pr.id, commitId: pr.commitId }))
        );

        this.operatePRNotifsToShow(news, "new");
        this.operatePRNotifsToShow(changed, "change");

        prStorage[accountId] = [...pullRequests];
        QueryHelper.savePRStorage(prStorage);
    }

    private static operateNotifsToShow(wis: WorkItem[], type: "new" | "change") {
        const wisToShow: WorkItem[] = [];
        const settings = useSettingsStore.getState();

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

    private static getPRById(storage: PullRequest[], id: number) {
        return storage.find((pr) => pr.id === id);
    }

    private static operatePRNotifsToShow(prs: PullRequest[], type: "new" | "change") {
        const prsToShow: PullRequest[] = [];
        const settings = useSettingsStore.getState();

        prs.forEach((pr) => {
            const belonging = pr.getBelonging();
            if (belonging) {
                if (belonging === "team" && !settings.includeTeamsPRs) return;
                prsToShow.push(pr);
            }
        });

        if (prsToShow.length < 2) {
            prsToShow.forEach((pr) => this.showPRNotif(this.createTextForPR(pr), type));
        } else {
            const count = prsToShow.length;
            this.showNotif(count + (type === "new" ? s("prsNew") : s("prsWasChanged")), type);
        }
    }

    private static createTextForPR(pr: PullRequest) {
        return `[${pr.repoName}] ${pr.id}: ${pr.title}`;
    }

    private static showPRNotif(text: string, reason?: "new" | "change") {
        let title = "Flowerpot";
        if (reason) {
            if (reason === "new") title += s("notifNewPR");
            if (reason === "change") title += s("notifChangedPR");
        }
        Platform.current.showNotification({ title: title, body: text });
    }

    private static showNotif(text: string, reason?: "new" | "change") {
        let title = "Flowerpot";
        if (reason) {
            if (reason === "new") title += s("notifNewItem");
            if (reason === "change") title += s("notifChangedItem");
        }
        Platform.current.showNotification({ title: title, body: text });
    }

    public static isChangesCollectionHasChanges(changesCollection: any) {
        return !!Object.values(changesCollection || {}).filter((x) => !!x).length;
    }
}
