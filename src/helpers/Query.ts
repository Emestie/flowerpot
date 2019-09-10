import store from "../store";
import { IWorkItem } from "./WorkItem";
import Electron from "./Electron";
import Loaders from "./Loaders";

type TBoolProps = "enabled" | "collapsed" | "ignoreNotif" | "ignoreIcon" | "empty";

export interface IQuery {
    queryId: string;
    queryName: string;
    teamId: string;
    teamName: string;
    enabled: boolean;
    collapsed: boolean;
    order: number;
    ignoreIcon: boolean;
    ignoreNotif: boolean;
    empty?: boolean;
}

export interface ITeam {
    guid: string;
    name: string;
}

interface IResponseQueryWI {
    id: number;
    url: string;
}

export interface IResponseQuery {
    workItems: IResponseQueryWI[];
}

export interface IFavQuery {
    queryItem: {
        id: string;
        name: string;
        isFolder: boolean;
    };
}

export interface IWIStorage {
    [queryId: string]: IWorkItem[] | undefined;
}

export default class Query {
    //! after any operation update queries array in store

    public static buildFromResponse(favQuery: IFavQuery, team: ITeam): IQuery {
        let query: IQuery = {
            collapsed: false,
            enabled: true,
            order: 99,
            queryId: favQuery.queryItem.id,
            queryName: favQuery.queryItem.name,
            teamId: team.guid,
            teamName: team.name,
            ignoreIcon: false,
            ignoreNotif: false,
        };

        return query;
    }

    public static add(query: IQuery) {
        let allQueries = store.getQueries(true);
        let allOrders = allQueries.map(q => q.order);
        let maxOrder = allOrders.length ? Math.max(...allOrders) : 0;
        query.order = maxOrder + 1;
        allQueries.push(query);
        this.updateAllInStore(allQueries);
    }

    public static delete(query: IQuery) {
        let allQueries = store.getQueries(true).filter(q => q.queryId !== query.queryId);
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
        let allQueries = store.getQueries(true);

        let index = this.findIndex(query);
        let indexToSwapWith = direction === "up" ? index - 1 : index + 1;

        let buffer = allQueries[indexToSwapWith].order;
        allQueries[indexToSwapWith].order = allQueries[index].order;
        allQueries[index].order = buffer;

        this.updateAllInStore(allQueries);
    }

    private static findIndex(query: IQuery) {
        let exactQueryIndex = store.getQueries(true).findIndex(q => q.queryId === query.queryId);
        return exactQueryIndex;
    }

    private static updateSingleInStore(query: IQuery) {
        let allQueries = store.getQueries(true);
        let index = this.findIndex(query);
        allQueries[index] = query;
        this.updateAllInStore(allQueries);
    }

    private static updateAllInStore(queries: IQuery[]) {
        store.settings.queries = store.copy(queries);
    }

    public static getWIStorage() {
        if (!(window as any).wiStorage) (window as any).wiStorage = {};
        let wiStorage = (window as any).wiStorage as IWIStorage;
        return wiStorage;
    }

    public static calculateIconLevel(query: IQuery, workItems: IWorkItem[]) {
        let wiStorage = this.getWIStorage();

        wiStorage[query.queryId] = store.copy(workItems);

        let queries = store.getQueries().filter(q => !q.ignoreIcon);
        let queriesIds = queries.map(q => q.queryId);

        let allWIs: IWorkItem[] = [];
        //clear incative queries in wi

        for (let x in wiStorage) {
            if (!queriesIds.includes(x) || Loaders.outage) wiStorage[x] = undefined;
            if (wiStorage[x]) allWIs = [...allWIs, ...(wiStorage[x] as IWorkItem[])];
        }

        if (store.settings.iconChangesOnMyWorkItemsOnly) {
            allWIs = allWIs.filter(wi => {
                return wi.assignedToFull.toLowerCase().indexOf(store.settings.tfsUser.toLowerCase()) !== -1;
            });
        }

        let level = allWIs.length ? 3 : 4;

        allWIs.forEach(wi => {
            if (wi.promptness && wi.promptness < level) level = wi.promptness;
            if (wi.rank === 1) level = wi.rank;
        });

        let hasChanges = false;
        for (let x in allWIs) {
            let wiChanges = store.getWIHasChanges(allWIs[x]);
            if (wiChanges) {
                hasChanges = true;
                break;
            }
        }

        Electron.updateTrayIcon(level, hasChanges);
    }
}
