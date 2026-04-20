import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { s } from "../values/Strings";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import Platform from "./Platform";

type TBoolProps = "enabled" | "ignoreNotif" | "ignoreIcon" | "empty";

export interface IWIStorage {
    [queryId: string]: WorkItem[] | undefined;
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
        const newBool = forcedValue !== undefined ? forcedValue : !query[boolPropName];
        const updatedQuery = {
            ...useSettingsStore.getState().queries.find((q) => q.queryId === query.queryId)!,
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
        const allQueries = useSettingsStore.getState().queries || [];
        const index = allQueries.findIndex((q) => q.queryId === query.queryId);
        const indexToSwapWith = direction === "up" ? index - 1 : index + 1;

        if (index < 0 || indexToSwapWith < 0 || indexToSwapWith >= allQueries.length) {
            return;
        }

        const tempOrder = allQueries[indexToSwapWith].order;
        allQueries[indexToSwapWith] = { ...allQueries[indexToSwapWith], order: allQueries[index].order };
        allQueries[index] = { ...allQueries[index], order: tempOrder };

        this.updateAllInStore([...allQueries.map((x) => ({ ...x }))]);
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

    public static getWIStorage() {
        // if (!(window as any).wiStorage) (window as any).wiStorage = {};
        // let wiStorage = (window as any).wiStorage as IWIStorage;
        // return wiStorage;
        let ls = localStorage.getItem("WIStorage");
        if (!ls) return {};
        else return JSON.parse(ls);
    }

    public static saveWIStorage(wis: IWIStorage) {
        localStorage.setItem("WIStorage", JSON.stringify(wis));
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
