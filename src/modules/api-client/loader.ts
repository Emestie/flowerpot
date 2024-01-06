import { IApiClientParams } from "./create";

export type Loader = ReturnType<typeof createLoader>;

export function createLoader(params: IApiClientParams) {
    return async function loader<T>(url: string): Promise<T> {
        const result = await fetch(params.getTfsPath() + url, {
            method: "GET",
            headers: { Authorization: "Basic " + btoa(":" + params.getAccessToken()) },
        });

        //TODO: 401 and other errors must be processed here

        const data = await result.json();

        return data as T;
    };
}
