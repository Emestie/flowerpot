import { IQuery, IWorkItem } from "../modules/api-client";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { getQueriesSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";
import { s } from "../values/Strings";
import Platform from "./Platform";

type TBoolProps = "enabled" | "collapsed" | "ignoreNotif" | "ignoreIcon" | "empty";

export interface IWIStorage {
    [queryId: string]: IWorkItem[] | undefined;
}

const permawatchQueryObject: IQuery = {
    collectionName: "",
    collapsed: false,
    enabled: true,
    ignoreIcon: true,
    ignoreNotif: false,
    queryId: "___permawatch",
    queryName: s("permawatch"),
    order: 99999,
    queryPath: "",
    teamId: "___permawatch",
    teamName: "",
    nameInList: "",
};

export default class Query {
    public static add(query: IQuery) {
        const allQueries = getQueriesSelector(true)(store.getState());
        const allOrders = allQueries.map((q) => q.order);
        const maxOrder = allOrders.length ? Math.max(...allOrders) : 0;
        query.order = maxOrder + 1;

        if (!!allQueries.find((aq) => aq.queryId === query.queryId)) return;

        allQueries.push(query);
        this.updateAllInStore(allQueries);
    }

    public static delete(query: IQuery) {
        let allQueries = getQueriesSelector(true)(store.getState()).filter((q) => q.queryId !== query.queryId);
        this.updateAllInStore(allQueries);
    }

    public static toggleBoolean(query: IQuery, boolPropName: TBoolProps, forcedValue?: boolean) {
        if (forcedValue === undefined) {
            query[boolPropName] = !query[boolPropName];
        } else {
            query[boolPropName] = forcedValue;
        }
        this.updateSingleInStore(query);
    }

    public static move(query: IQuery, direction: "up" | "dn") {
        let allQueries = getQueriesSelector(true)(store.getState());

        let index = this.findIndex(query);
        let indexToSwapWith = direction === "up" ? index - 1 : index + 1;

        let buffer = allQueries[indexToSwapWith].order;
        allQueries[indexToSwapWith].order = allQueries[index].order;
        allQueries[index].order = buffer;

        this.updateAllInStore(allQueries);
    }

    private static findIndex(query: IQuery) {
        let exactQueryIndex = getQueriesSelector(true)(store.getState()).findIndex((q) => q.queryId === query.queryId);
        return exactQueryIndex;
    }

    private static updateSingleInStore(query: IQuery) {
        let allQueries = getQueriesSelector(true)(store.getState());
        let index = this.findIndex(query);
        allQueries[index] = query;
        this.updateAllInStore(allQueries);
    }

    private static updateAllInStore(queries: IQuery[]) {
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

    public static calculateIconLevel(query: IQuery, workItems: IWorkItem[]) {
        let wiStorage = this.getWIStorage();
        const state = store.getState();

        wiStorage[query.queryId] = [...workItems];

        let queries = getQueriesSelector()(state).filter((q) => !q.ignoreIcon);
        let queriesIds = queries.map((q) => q.queryId);

        let allWIs: IWorkItem[] = [];
        //clear incative queries in wi

        for (let x in wiStorage) {
            //TODO: if (!queriesIds.includes(x) || Loaders.outage) wiStorage[x] = undefined;
            if (wiStorage[x]) allWIs = [...allWIs, ...(wiStorage[x] as IWorkItem[])];
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

    public static getFakePermawatchQuery(): IQuery {
        return permawatchQueryObject;
    }
}
