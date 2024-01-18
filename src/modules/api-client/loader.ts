import { IApiClientParams } from "./create";
import { fillConnectionData, getConnectionData } from "/@/helpers/Connection";
import { s } from "/@/values/Strings";

export type Loader = ReturnType<typeof createLoader>;

export function createLoader(params: IApiClientParams) {
    return async function loader<T>(
        url: string,
        options?: { method?: "GET" | "POST"; body?: string; skipConnectionDataCheck?: boolean }
    ): Promise<T> {
        try {
            const result = await fetch(params.getTfsPath() + url, {
                method: options?.method || "GET",
                body: options?.body,
                headers: {
                    Authorization: "Basic " + btoa(":" + params.getAccessToken()),
                    "Content-Type": "application/json",
                },
            });

            try {
                if (!options?.skipConnectionDataCheck && !getConnectionData()) await fillConnectionData();
            } catch {}

            if (result.status === 401 && !url.includes("connectionData")) {
                throw new Error(s("unauthorized"));
            }

            if (!result.ok) return null as T;

            const data = await result.json();

            return data as T;
        } catch (e: any) {
            params.onError(e.message);

            return null as T;
        }
    };
}
