import { IStore } from "../store";

export function appSelector(store: IStore) {
    return store.app;
}
