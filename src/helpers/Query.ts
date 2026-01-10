import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { getQueriesSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";
import { s } from "../values/Strings";
import Platform from "./Platform";

type TBoolProps = "enabled" | "ignoreNotif" | "ignoreIcon" | "empty";

export interface IWIStorage {
    [queryId: string]: WorkItem[] | undefined;
}

export default class QueryHelper {
    public static add(query: Query) {
        const allQueries = getQueriesSelector(true)(store.getState());
        const allOrders = allQueries.map((q) => q.order);
        const maxOrder = allOrders.length ? Math.max(...allOrders) : 0;
        query.order = maxOrder + 1;

        if (!!allQueries.find((aq) => aq.queryId === query.queryId && aq.accountId === query.accountId)) return;

        allQueries.push(query);
        this.updateAllInStore(allQueries);
    }

    public static delete(query: Query) {
        let allQueries = getQueriesSelector(true)(store.getState()).filter((q) => q.queryId !== query.queryId);
        this.updateAllInStore(allQueries);
    }

    public static toggleBoolean(query: Query, boolPropName: TBoolProps, forcedValue?: boolean) {
        if (forcedValue === undefined) {
            query[boolPropName] = !query[boolPropName];
        } else {
            query[boolPropName] = forcedValue;
        }
        this.updateSingleInStore(query);
    }

    public static move(query: Query, direction: "up" | "dn") {
        let allQueries = getQueriesSelector(true)(store.getState());

        let index = this.findIndex(query);
        let indexToSwapWith = direction === "up" ? index - 1 : index + 1;

        let buffer = allQueries[indexToSwapWith].order;
        allQueries[indexToSwapWith].order = allQueries[index].order;
        allQueries[index].order = buffer;

        this.updateAllInStore(allQueries);
    }

    private static findIndex(query: Query) {
        let exactQueryIndex = getQueriesSelector(true)(store.getState()).findIndex((q) => q.queryId === query.queryId);
        return exactQueryIndex;
    }

    private static updateSingleInStore(query: Query) {
        let allQueries = getQueriesSelector(true)(store.getState());
        let index = this.findIndex(query);
        allQueries[index] = query;
        this.updateAllInStore(allQueries);
    }

    private static updateAllInStore(queries: Query[]) {
        store.dispatch(settingsUpdate({ queries }));
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
        const state = store.getState();

        wiStorage[query.queryId] = [...workItems];

        let allWIs: WorkItem[] = [];
        //clear incative queries in wi

        for (let x in wiStorage) {
            //TODO: if (!queriesIds.includes(x) || Loaders.outage) wiStorage[x] = undefined;
            if (wiStorage[x]) allWIs = [...allWIs, ...(wiStorage[x] as WorkItem[])];
        }

        let hasChanges = false;
        for (let x in allWIs) {
            let wiChanges = !!state.data.changesCollection[allWIs[x].id];
            if (wiChanges) {
                hasChanges = true;
                break;
            }
        }

        if (state.settings.iconChangesOnMyWorkItemsOnly) {
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
