import { api } from "../api/client";
import { IConnectionData } from "../modules/api-client";

let currentConnection: IConnectionData;

export async function fillConnectionData() {
    const connectionData = await api.connectionData.get();
    currentConnection = connectionData;

    (window as any)._conn = connectionData;
}

export function getConnectionData() {
    return currentConnection;
}
