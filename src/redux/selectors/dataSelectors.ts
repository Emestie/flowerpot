import { IStore } from "../store";

export function dataSelector(store: IStore) {
    return store.data;
}