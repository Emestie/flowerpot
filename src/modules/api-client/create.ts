import { createLoader } from "./loader";
import { createPullRequestLoaders } from "./pull-request";

export interface IApiClientParams {
    getTfsPath: () => string;
    getAccessToken: () => string;
}

export function createApiClient(params: IApiClientParams) {
    const loader = createLoader(params);

    return {
        pullRequest: createPullRequestLoaders(params, loader),
    };
}
