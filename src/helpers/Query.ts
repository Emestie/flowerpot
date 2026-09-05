import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { PullRequest } from "../models/pull-request";
import { s } from "../values/Strings";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import Platform from "./Platform";
import { safeParse } from "./safe-parse";

type TBoolProps = "enabled" | "ignoreNotif" | "ignoreIcon" | "empty";

export interface IWIStorage {
    [queryId: string]: WorkItem[] | undefined;
}

export interface IPRStorage {
    [accountId: string]: PullRequest[];
}

export default class QueryHelper {
    public static add(query: Query) {
        const allQueries = useSettingsStore.getState().queries;
        const allOrders = allQueries.map((q) => q.order);
        const maxOrder = allOrders.length ? Math.max(...allOrders) : 0;
        query.order = maxOrder + 1;

        if (!!allQueries.find((aq) => aq.queryId === query.queryId && aq.accountId === query.accountId)) return;

        this.updateAllInStore([...allQueries, query]);
    }

    public static delete(query: Query) {
        let allQueries = useSettingsStore.getState().queries.filter((q) => q.queryId !== query.queryId);
        this.updateAllInStore(allQueries);
    }

    public static toggleBoolean(query: Query, boolPropName: TBoolProps, forcedValue?: boolean) {
        const stored = useSettingsStore.getState().queries.find((q) => q.queryId === query.queryId);
        if (!stored) return;
        const newBool = forcedValue !== undefined ? forcedValue : !query[boolPropName];
        const updatedQuery = {
            ...stored,
            [boolPropName]: newBool,
        };
        this.updateSingleInStore(updatedQuery);
    }

    public static updateFilteredTypes(query: Query, filteredTypes: string[]) {
        const updatedQuery = { ...query, filteredTypes };
        this.updateSingleInStore(updatedQuery);
    }

    public static updateFilteredStatuses(query: Query, filteredStatuses: string[]) {
        const updatedQuery = { ...query, filteredStatuses };
        this.updateSingleInStore(updatedQuery);
    }

    public static move(query: Query, direction: "up" | "dn") {
        const storedQueries = useSettingsStore.getState().queries || [];
        const index = storedQueries.findIndex((q) => q.queryId === query.queryId);
        const indexToSwapWith = direction === "up" ? index - 1 : index + 1;

        if (index < 0 || indexToSwapWith < 0 || indexToSwapWith >= storedQueries.length) {
            return;
        }

        const allQueries = storedQueries.map((x) => ({ ...x }));
        const tempOrder = allQueries[indexToSwapWith].order;
        allQueries[indexToSwapWith] = { ...allQueries[indexToSwapWith], order: allQueries[index].order };
        allQueries[index] = { ...allQueries[index], order: tempOrder };

        this.updateAllInStore(allQueries);
    }

    private static updateSingleInStore(query: Query) {
        const allQueries = useSettingsStore.getState().queries || [];
        const index = allQueries.findIndex((q) => q.queryId === query.queryId);
        if (index < 0) return;
        const updatedQueries = [...allQueries];
        updatedQueries[index] = query;
        this.updateAllInStore(updatedQueries);
    }

    private static updateAllInStore(queries: Query[]) {
        useSettingsStore.getState().setQueries([...queries.map((x) => ({ ...x }))]);
    }

    public static getWIStorage(): IWIStorage {
        // if (!(window as any).wiStorage) (window as any).wiStorage = {};
        // let wiStorage = (window as any).wiStorage as IWIStorage;
        // return wiStorage;
        const ls = localStorage.getItem("WIStorage");
        if (!ls) return {};
        return safeParse<IWIStorage>(ls, {}, "WIStorage");
    }

    public static saveWIStorage(wis: IWIStorage) {
        localStorage.setItem("WIStorage", JSON.stringify(wis));
    }

    public static getPRStorage(): IPRStorage {
        const ls = localStorage.getItem("PRStorage");
        if (!ls) return {};
        return safeParse<IPRStorage>(ls, {}, "PRStorage");
    }

    public static savePRStorage(prs: IPRStorage) {
        localStorage.setItem("PRStorage", JSON.stringify(prs));
    }

    public static calculateIconLevel(query: Query, workItems: WorkItem[]) {
        let wiStorage = this.getWIStorage();

        wiStorage[query.queryId] = [...workItems];

        let allWIs: WorkItem[] = [];
        //clear incative queries in wi

        for (let x in wiStorage) {
            //TODO: if (!queriesIds.includes(x) || Loaders.outage) wiStorage[x] = undefined;
            if (wiStorage[x]) allWIs = [...allWIs, ...(wiStorage[x] as WorkItem[])];
        }

        let hasChanges = false;
        for (let x in allWIs) {
            let wiChanges = !!useDataStore.getState().changesCollection[allWIs[x].id];
            if (wiChanges) {
                hasChanges = true;
                break;
            }
        }

        if (useSettingsStore.getState().iconChangesOnMyWorkItemsOnly) {
            allWIs = allWIs.filter((wi) => wi._isMine);
        }

        let level = allWIs.length ? 3 : 4;

        allWIs.forEach((wi) => {
            if (wi.isRed) level = 1;
        });

        Platform.current.updateTrayIcon(level, hasChanges);
    }

    public static getFakePermawatchQuery(accountId: string): Query {
        const pwqo = new Query(
            accountId,
            {
                id: `___permawatch_${accountId}`,
                isFolder: false,
                isPublic: false,
                name: s("permawatch"),
                path: "",
            },
            { collectionName: "", guid: "___permawatch", name: "", accountId, enabled: true, path: "" }
        );

        pwqo.order = 99999;
        pwqo.ignoreIcon = true;
        pwqo.nameInList = "";

        return pwqo;
    }
}
