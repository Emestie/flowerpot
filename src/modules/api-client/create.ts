import { createLoader } from "./loader";
import { createCollectionLoaders, createProjectLoaders, createPullRequestLoaders, createQueryLoaders } from "./loaders";

export interface IApiClientParams {
    getTfsPath: () => string;
    getTfsUser: () => string;
    getAccessToken: () => string;
}

export function createApiClient(params: IApiClientParams) {
    const loader = createLoader(params);

    return {
        pullRequest: createPullRequestLoaders(params, loader),
        collection: createCollectionLoaders(loader),
        project: createProjectLoaders(loader),
        query: createQueryLoaders(loader),
    };
}
