import { getApi } from "../api/client";
import { IConnectionData } from "../modules/api-client";

const currentConnectionData: Record<string, IConnectionData | undefined> = {};
const singletonPromise: Record<string, Promise<IConnectionData | undefined> | null> = {};

export function preloadConnectionData(accountId: string) {
    if (currentConnectionData[accountId]) {
        return Promise.resolve(currentConnectionData[accountId]);
    }

    if (!singletonPromise[accountId]) {
        singletonPromise[accountId] = getApi(accountId)
            .connectionData.get()
            .then((resp) => {
                currentConnectionData[accountId] = resp;

                return resp;
            })
            .catch(() => {
                singletonPromise[accountId] = null;
                return undefined;
            });
    }

    return singletonPromise[accountId];
}

export function getConnectionData(accountId: string) {
    return currentConnectionData[accountId];
}
