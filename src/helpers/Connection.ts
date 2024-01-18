import { api } from "../api/client";
import { IConnectionData } from "../modules/api-client";

let currentConnectionData: IConnectionData;

let singletonPromise: Promise<IConnectionData> | null = null;

export function fillConnectionData() {
    if (!singletonPromise) {
        singletonPromise = api.connectionData.get().then((resp) => {
            currentConnectionData = resp;
            (window as any)._conn = resp;

            return resp;
        });
    }

    return singletonPromise;
}

export function getConnectionData() {
    return currentConnectionData;
}
