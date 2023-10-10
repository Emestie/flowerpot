import { IApiClientParams } from "./create";
import { Loader } from "./loader";
import { IResponsePullRequest } from "./types/pull-request";
import { IProject } from "/@/helpers/Project";
import { buildPullRequest } from "/@/models/pull-request";

export function createPullRequestLoaders(params: IApiClientParams, loader: Loader) {
    return {
        async getByProjects(projects: IProject[]) {
            if (!projects.length) return [];

            const responsePullRequests = await Promise.all(
                projects.map((p) =>
                    loader<IResponsePullRequest>(`${p.collectionName}/${p.name}/_apis/git/pullrequests?api-version=5`),
                ),
            );

            return responsePullRequests
                .map((resp, index) => buildPullRequest(resp, params.getTfsPath(), projects[index].collectionName))
                .sort((a, b) => b.id - a.id);
        },
    };
}
