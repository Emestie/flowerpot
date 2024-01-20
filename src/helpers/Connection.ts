import { api } from "../api/client";
import { IConnectionData } from "../modules/api-client";

let currentConnectionData: IConnectionData | undefined;

let singletonPromise: Promise<IConnectionData | undefined> | null = null;

export function fillConnectionData() {
    if (!singletonPromise) {
        singletonPromise = api.connectionData.get().then((resp) => {
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
