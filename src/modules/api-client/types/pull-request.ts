export interface IResponsePullRequest {
    createdBy: {
        displayName: string;
        uniqueName: string;
        imageUrl: string;
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
