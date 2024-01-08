import { IApiClientParams } from "./create";

export type Loader = ReturnType<typeof createLoader>;

export function createLoader(params: IApiClientParams) {
    return async function loader<T>(url: string, options?: { method?: "GET" | "POST"; body?: string }): Promise<T> {
        const result = await fetch(params.getTfsPath() + url, {
            method: options?.method || "GET",
            body: options?.body,
            headers: {
                Authorization: "Basic " + btoa(":" + params.getAccessToken()),
                "Content-Type": "application/json",
            },
        });

        //TODO: 401 and other errors must be processed here

        const data = await result.json();

        return data as T;
    };
}
