import { getApi } from "../api/client";
import { IConnectionData } from "../modules/api-client";

let currentConnectionData: IConnectionData | undefined;
//TODO: diff by ID, actually add to account model and preload on migration

let singletonPromise: Promise<IConnectionData | undefined> | null = null;

export function fillConnectionData(accountId: string) {
    if (!singletonPromise) {
        singletonPromise = getApi(accountId)
            .connectionData.get()
            .then((resp) => {
                currentConnectionData = resp;
                (window as any)._conn = resp;
                singletonPromise = null;

                return resp;
            });
    }

    return singletonPromise;
}

export function getConnectionData() {
    return currentConnectionData;
}
