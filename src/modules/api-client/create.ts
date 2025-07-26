import { createLoader } from "./loader";
import {
    createCollectionLoaders,
    createConnectionDataLoaders,
    createProjectLoaders,
    createPullRequestLoaders,
    createQueryLoaders,
    createWorkItemLoaders,
} from "./loaders";
import { createWorkItemTypeLoaders } from "./loaders/work-item-type";

export interface IApiClientParams {
    getAccountId: () => string;
    getTfsPath: () => string;
    getAccessToken: () => string;
    onError: (message: string) => void;
}

export function createApiClient(params: IApiClientParams) {
    const loader = createLoader(params);

    const workItemTypeLoaders = createWorkItemTypeLoaders(loader);

    return {
        pullRequest: createPullRequestLoaders(params, loader),
        collection: createCollectionLoaders(loader),
        project: createProjectLoaders(params, loader),
        query: createQueryLoaders(params, loader),
        workItem: createWorkItemLoaders(loader, workItemTypeLoaders),
        workItemType: workItemTypeLoaders,
        connectionData: createConnectionDataLoaders(loader),
    };
}
