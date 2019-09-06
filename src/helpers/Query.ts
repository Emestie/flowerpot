import store from "../store";
import { ITeam, IFavQuery } from "./Loaders";

export interface IQuery {
    queryId: string;
    queryName: string;
    teamId: string;
    teamName: string;
    enabled: boolean;
    collapsed: boolean;
    order: number;
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

    public static toggleEnability(query: IQuery) {
        query.enabled = !query.enabled;
        this.updateSingleInStore(query);
    }

    public static toggleCollapse(query: IQuery) {
        query.collapsed = !query.collapsed;
        this.updateSingleInStore(query);
    }

    public static move(query: IQuery, direction: "up" | "dn") {
        let allQueries = store.getQueries(true);

        let index = this.findIndex(query);
        let indexToSwapWith = direction == "up" ? index - 1 : index + 1;

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
}
