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
        id: string;
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
        id: string;
    }[];
    targetRefName: string;
    sourceRefName: string;
    labels: { name: string }[];
    mergeStatus: "conflicts" | "succeeded";
}
