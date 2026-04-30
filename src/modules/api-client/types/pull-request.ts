export interface IResponsePullRequest {
    createdBy: {
        displayName: string;
        uniqueName: string;
        imageUrl: string;
        descriptor: string;
    };
    isDraft: boolean;
    creationDate: string;
    lastMergeSourceCommit: {
        commitId: string;
        url: string;
    };
    pullRequestId: number;
    repository: {
        id: string;
        name: string;
        project: {
            id: string;
            name: string;
        };
    };
    title: string;
    url: string;
    status: string;
    reviewers: {
        displayName: string;
        imageUrl: string;
        uniqueName: string;
        isRequired: boolean;
        vote: number;
        id: string;
    }[];
    targetRefName: string;
    sourceRefName: string;
    labels: { name: string }[];
    mergeStatus: "conflicts" | "succeeded";
}

export interface IPullRequestStats {
    pullRequestArtifactId: string;
    lastUpdatedDate: string;
    commentsCount: number;
    threadsExist: boolean;
    newThreadsCount: Record<string, number> | null;
}

export interface IHierarchyQueryResponse {
    dataProviders: {
        "ms.vss-code-web.pullrequests-artifact-stats-data-provider"?: {
            "TFS.VersionControl.PullRequestListArtifactStatsProvider.artifactStats": IPullRequestStats[];
        };
        [key: string]: any;
    };
}
