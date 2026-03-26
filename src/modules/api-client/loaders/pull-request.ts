import { preloadConnectionData } from "../../../helpers/Connection";
import { Project } from "../../../models/project";
import { PullRequest } from "../../../models/pull-request";
import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { IHierarchyQueryResponse, IPullRequestStats, IResponsePullRequest, IValue } from "../types";
import { IPullRequestThread } from "../types/thread";

export function createPullRequestLoaders(params: IApiClientParams, loader: Loader) {
    return {
        async getByProjects(projects: Project[]): Promise<PullRequest[]> {
            if (!projects.length) return [];

            await preloadConnectionData(params.getAccountId());

            const responsePullRequestCollections = await Promise.all(
                projects.map((p) =>
                    loader<IValue<IResponsePullRequest[]>>(
                        `${p.collectionName}/${p.name}/_apis/git/pullrequests?$top=10000&api-version=7.1`
                    ).then((resp) => {
                        if (resp?.message && resp.errorCode !== undefined) {
                            throw new Error(resp.message);
                        }

                        return resp;
                    })
                )
            );

            const allFetchedPRs = responsePullRequestCollections.flatMap((c) => c.value);
            if (!allFetchedPRs.length) return [];

            const stats = await this.getStats(allFetchedPRs, projects[0].collectionName);

            return responsePullRequestCollections
                .flatMap((collection, index) =>
                    collection.value.map((resp) => {
                        const prStats = stats.find((s) => s.pullRequestArtifactId.endsWith(`%2F${resp.pullRequestId}`));
                        const newThreadsCount = prStats?.newThreadsCount?.["0"] || 0;

                        return new PullRequest(
                            resp,
                            projects[index].collectionName,
                            params.getAccountId(),
                            newThreadsCount || 0
                        );
                    })
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
        async getStats(allFetchedPRs: IResponsePullRequest[], collectionName: string): Promise<IPullRequestStats[]> {
            const artifactIds = allFetchedPRs.map((pr) => ({
                artifactId: `vstfs:///Git/PullRequestId/${pr.repository.project.id}%2F${pr.repository.id}%2F${pr.pullRequestId}`,
                discussionArtifactId: `vstfs:///CodeReview/ReviewId/${pr.repository.project.id}%2F${pr.pullRequestId}`,
            }));

            const statsResult = await loader<IHierarchyQueryResponse>(
                `${collectionName}/_apis/Contribution/HierarchyQuery?api-version=5.0-preview.1`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        contributionIds: ["ms.vss-code-web.pullrequests-artifact-stats-data-provider"],
                        dataProviderContext: { properties: { artifactIds } },
                    }),
                }
            ).catch(() => null);

            const stats =
                statsResult?.dataProviders?.["ms.vss-code-web.pullrequests-artifact-stats-data-provider"]?.[
                    "TFS.VersionControl.PullRequestListArtifactStatsProvider.artifactStats"
                ] || [];

            return stats;
        },
    };
}
