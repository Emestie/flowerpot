import { preloadConnectionData } from "../../../helpers/Connection";
import { Project } from "../../../models/project";
import { PullRequest } from "../../../models/pull-request";
import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { IResponsePullRequest, IValue } from "../types";
import { IPullRequestThread } from "../types/thread";

export function createPullRequestLoaders(params: IApiClientParams, loader: Loader) {
    return {
        async getByProjects(projects: Project[]): Promise<PullRequest[]> {
            if (!projects.length) return [];

            const [responsePullRequestCollections] = await Promise.all([
                await Promise.all(
                    projects.map((p) =>
                        loader<IValue<IResponsePullRequest[]>>(
                            `${p.collectionName}/${p.name}/_apis/git/pullrequests?api-version=5`
                        ).then((resp) => {
                            if (resp?.message && resp.errorCode !== undefined) {
                                throw new Error(resp.message);
                            }

                            return resp;
                        })
                    )
                ),
                await preloadConnectionData(params.getAccountId()),
            ]);

            return responsePullRequestCollections
                .flatMap((collection, index) =>
                    collection.value.map(
                        (resp) =>
                            new PullRequest(
                                resp,
                                params.getTfsPath(),
                                projects[index].collectionName,
                                params.getAccountId()
                            )
                    )
                )
                .sort((a, b) => b.id - a.id);
        },
        async getCommentsCount(pullRequest: PullRequest): Promise<{ resolved: number; total: number }> {
            const threadsResult = await loader<{ value: IPullRequestThread[] }>(
                `${pullRequest.collectionName}/${pullRequest.projectName}/_apis/git/repositories/${pullRequest.repoId}/pullRequests/${pullRequest.id}/threads?api-version=7.0`
            );

            const threads = threadsResult.value.filter((x) => !x.isDeleted);

            const allWithStatus = threads.filter((th) => !!th.status).length;
            const allResolved = threads.filter((th) => th.status === "fixed" || th.status === "closed").length;

            return { resolved: allResolved, total: allWithStatus };
        },
    };
}
