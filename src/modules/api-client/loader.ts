import { IApiClientParams } from "./create";
import { s } from "/@/values/Strings";

export type Loader = ReturnType<typeof createLoader>;

export function createLoader(params: IApiClientParams) {
    return async function loader<T>(
        url: string,
        options?: { method?: "GET" | "POST"; body?: string; skipConnectionDataCheck?: boolean }
    ): Promise<T> {
        try {
            const _tfsPath = params.getTfsPath();
            const _url = url.replace(_tfsPath, "");

            const result = await fetch(_tfsPath + _url, {
                method: options?.method || "GET",
                body: options?.body,
                headers: {
                    Authorization: "Basic " + btoa(":" + params.getAccessToken()),
                    "Content-Type": "application/json",
                },
            });

            if (result.status === 401 && !url.includes("connectionData")) {
                throw new Error(s("unauthorized"));
            }

            if (result.status === 404) {
                throw new Error(s("notFoundOrNoAccess"));
            }

            try {
                const data = await result.json();
                return data as T;
            } catch {
                throw new Error(s("jsonParseError"));
            }
        } catch (e: any) {
            throw e;
        }
    };
}
