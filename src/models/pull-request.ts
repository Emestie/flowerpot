import { ItemsCommon } from "../helpers/ItemsCommon";
import { IResponsePullRequest } from "../modules/api-client";

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
}

export function buildPullRequest(resp: IResponsePullRequest, tfsPath: string, collection: string): IPullRequest {
    return {
        id: resp.pullRequestId,
        authorFullName: ItemsCommon.parseNameField(resp.createdBy),
        authorName: ItemsCommon.shortName(ItemsCommon.parseNameField(resp.createdBy)),
        authorUid: resp.createdBy.uniqueName,
        authorAvatar: resp.createdBy.imageUrl,
        date: resp.creationDate,
        isDraft: resp.isDraft,
        projectName: resp.repository.project.name,
        repoName: resp.repository.name,
        reviewers: resp.reviewers.map((rev) => ({
            name: rev.displayName,
            uid: rev.uniqueName,
            imageUrl: rev.imageUrl,
            isRequired: !!rev.isRequired,
            vote: rev.vote,
        })),
        status: resp.status,
        title: resp.title,
        url:
            tfsPath +
            `${collection}/${resp.repository.project.name}/_git/${resp.repository.name}/pullrequest/${resp.pullRequestId}`,
        freshness: ItemsCommon.getTerm(resp.creationDate),
        sourceBranch: resp.sourceRefName.replace("refs/heads/", ""),
        targetBranch: resp.targetRefName.replace("refs/heads/", ""),
        labels: resp.labels || [],
        mergeStatus: resp.mergeStatus,
    };
}
