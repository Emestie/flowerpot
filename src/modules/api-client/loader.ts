import { IApiClientParams } from "./create";
import { s } from "../../values/Strings";

export type Loader = ReturnType<typeof createLoader>;

/** Joins a base URL (with or without a trailing slash) and a relative path (with or without a leading slash). */
function joinUrl(base: string, path: string) {
    return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

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

        //absolute URLs (e.g. _links.href values returned by the API, which can
        //point to *.vssps.visualstudio.com service hosts) are used as-is
        const targetUrl = /^https?:\/\//i.test(url) ? url : joinUrl(_tfsPath, url);

        const result = await fetch(targetUrl, {
            method: options?.method || "GET",
            body: options?.body,
            headers: {
                Authorization: "Basic " + btoa(":" + params.getAccessToken()),
                "Content-Type": options?.contentType || "application/json",
                //without it Azure DevOps Services answers an invalid token with a
                //redirect to the sign-in page (203 text/html) instead of a plain 401
                "X-TFS-FedAuthRedirect": "Suppress",
            },
        });

        //Azure DevOps Services responses with an HTML sign-in page come through
        //redirect chains as 203/text/html, so they are treated as unauthorized too
        const isUnauthorized =
            result.status === 401 ||
            result.status === 203 ||
            (result.headers.get("content-type") || "").includes("text/html");

        if (isUnauthorized && !url.includes("connectionData")) {
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
