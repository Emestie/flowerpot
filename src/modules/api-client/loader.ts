import { IApiClientParams } from "./create";

export type Loader = ReturnType<typeof createLoader>;

export function createLoader(params: IApiClientParams) {
    return async function loader<T>(url: string): Promise<T> {
        const result = await fetch(params.getTfsPath() + url, {
            method: "GET",
            headers: { Authorization: "Bearer " + params.getAccessToken() },
            //TODO: this auth is not working
        });

        const data = await result.json();

        return data as T;
    };
}
