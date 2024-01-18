import { IStore } from "../store";
import { IQuery } from "/@/modules/api-client";

export function dataSelector(store: IStore) {
    return store.data;
}

export function getWorkItemsForQuerySelector(query: IQuery) {
    return (store: IStore) => {
        return store.data.workItems.filter((wi) => wi._queryId === query.queryId);
    };
}
