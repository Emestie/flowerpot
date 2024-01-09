import { createLoader } from "./loader";
import {
    createCollectionLoaders,
    createProjectLoaders,
    createPullRequestLoaders,
    createQueryLoaders,
    createWorkItemLoaders,
} from "./loaders";

export interface IApiClientParams {
    getTfsPath: () => string;
    getTfsUser: () => string;
    getAccessToken: () => string;
    onError: (message: string) => void;
}

export function createApiClient(params: IApiClientParams) {
    const loader = createLoader(params);

    return {
        pullRequest: createPullRequestLoaders(params, loader),
        collection: createCollectionLoaders(loader),
        project: createProjectLoaders(loader),
        query: createQueryLoaders(loader),
        workItem: createWorkItemLoaders(loader),
    };
}
