import { getApi } from "../api/client";
import { IConnectionData } from "../modules/api-client";

const currentConnectionData: Record<string, IConnectionData | undefined> = {};
const singletonPromise: Record<string, Promise<IConnectionData | undefined> | null> = {};

export function preloadConnectionData(accountId: string) {
    if (!singletonPromise[accountId]) {
        singletonPromise[accountId] = getApi(accountId)
            .connectionData.get()
            .then((resp) => {
                currentConnectionData[accountId] = resp;
                (window as any)._conn = resp;
                singletonPromise[accountId] = null;

                return resp;
            });
    }

    return singletonPromise[accountId];
}

export function getConnectionData(accountId: string) {
    return currentConnectionData[accountId];
}
