import { Query } from "../../models/query";
import { IStore } from "../store";

export function dataSelector(store: IStore) {
    return store.data;
}

export function getWorkItemsForQuerySelector(query: Query) {
    return (store: IStore) => {
        return store.data.workItems.filter((wi) => wi._queryId === query.queryId);
    };
}
