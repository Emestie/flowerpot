import Query from "../../helpers/Query";
import { IStore } from "../store";

export function settingsSelector(store: IStore) {
    return store.settings;
}

export function getQueriesSelector(all?: boolean) {
    return (store: IStore) => {
        const queries = store.settings.queries.sort((a, b) => a.order - b.order);
        
        if (all) return queries;

        if (store.settings.lists.permawatch.length) queries.push(Query.getFakePermawatchQuery());

        return queries.filter((q) => !!q.enabled);
    };
}
