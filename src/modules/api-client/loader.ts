import { IApiClientParams } from "./create";
import { s } from "../../values/Strings";

export type Loader = ReturnType<typeof createLoader>;

export function createLoader(params: IApiClientParams) {
    return async function loader<T>(
        url: string,
        options?: {
            method?: "GET" | "POST" | "PATCH";
            body?: string;
            contentType?: string;
            skipConnectionDataCheck?: boolean;
        }
    ): Promise<T> {
        const _tfsPath = params.getTfsPath();
        const _url = url.startsWith(_tfsPath) ? url.slice(_tfsPath.length) : url;

        const result = await fetch(_tfsPath + _url, {
            method: options?.method || "GET",
            body: options?.body,
            headers: {
                Authorization: "Basic " + btoa(":" + params.getAccessToken()),
                "Content-Type": options?.contentType || "application/json",
            },
        });

        if (result.status === 401 && !url.includes("connectionData")) {
            throw new Error(s("unauthorized"));
        }

        if (result.status === 404) {
            throw new Error(s("notFoundOrNoAccess"));
        }

        //Parse the body first: API error payloads (errorCode/message) are
        //inspected by callers, so they must flow through as data.
        let data: T | undefined;
        try {
            data = (await result.json()) as T;
        } catch {
            data = undefined;
        }

        if (data === undefined) {
            throw new Error(!result.ok ? `HTTP ${result.status}` : s("jsonParseError"));
        }

        return data;
    };
}
