import { Loader } from "../loader";
import { IConnectionData } from "../types";

export function createConnectionDataLoaders(loader: Loader) {
    return {
        async get(): Promise<IConnectionData> {
            const connectionData = await loader<IConnectionData>("_apis/connectionData", {
                skipConnectionDataCheck: true,
            });

            return connectionData;
        },
    };
}
