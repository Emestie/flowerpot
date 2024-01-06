import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { buildPullRequest } from "../models";
import { IProject, IResponsePullRequest, IValue } from "../types";

export function createPullRequestLoaders(params: IApiClientParams, loader: Loader) {
    return {
        async getByProjects(projects: IProject[]) {
            if (!projects.length) return [];

            const responsePullRequestCollections = await Promise.all(
                projects.map((p) =>
                    loader<IValue<IResponsePullRequest[]>>(
                        `${p.collectionName}/${p.name}/_apis/git/pullrequests?api-version=5`,
                    ),
                ),
            );

            return responsePullRequestCollections
                .flatMap((collection, index) =>
                    collection.value.map((resp) =>
                        buildPullRequest(
                            resp,
                            params.getTfsPath(),
                            params.getTfsUser(),
                            projects[index].collectionName,
                        ),
                    ),
                )
                .sort((a, b) => b.id - a.id);
        },
    };
}
