export interface IResponsePullRequest {
    createdBy: {
        displayName: string;
        uniqueName: string;
        imageUrl: string;
        descriptor: string;
    };
    isDraft: boolean;
    creationDate: string;
    pullRequestId: number;
    repository: {
        name: string;
        project: {
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
    }[];
    targetRefName: string;
    sourceRefName: string;
    labels: { name: string }[];
    mergeStatus: "conflicts" | "succeeded";
}

export interface IPullRequestReviewer {
    name: string;
    uid: string;
    imageUrl: string;
    isRequired: boolean;
    vote: number;
}

export interface IPullRequest {
    id: number;
    isDraft: boolean;
    authorName: string;
    authorFullName: string;
    authorUid: string;
    authorAvatar: string;
    authorDescriptor: string;
    date: string;
    projectName: string;
    repoName: string;
    title: string;
    url: string;
    status: string;
    reviewers: IPullRequestReviewer[];
    freshness: string;
    sourceBranch: string;
    targetBranch: string;
    labels: { name: string }[];
    mergeStatus: "conflicts" | "succeeded";
    isMine: () => boolean;
    getAuthorTextName: () => string;
}
