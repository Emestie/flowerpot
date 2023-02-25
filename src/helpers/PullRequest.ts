import { store } from "../redux/store";
import { ItemsCommon } from "./ItemsCommon";

export interface IPRReviewer {
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
    reviewers: IPRReviewer[];
    freshness: string;
    sourceBranch: string;
    targetBranch: string;
    labels: { name: string }[];
    mergeStatus: "conflicts" | "succeeded";
}

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
    _collection: string;
    labels: { name: string }[];
    mergeStatus: "conflicts" | "succeeded";
}

export class PullRequest {
    public static buildFromResponse(resp: IResponsePullRequest): IPullRequest {
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
                store.getState().settings.tfsPath +
                `${resp._collection}/${resp.repository.project.name}/_git/${resp.repository.name}/pullrequest/${resp.pullRequestId}`,
            freshness: ItemsCommon.getTerm(resp.creationDate),
            sourceBranch: resp.sourceRefName.replace("refs/heads/", ""),
            targetBranch: resp.targetRefName.replace("refs/heads/", ""),
            labels: resp.labels || [],
            mergeStatus: resp.mergeStatus,
        };
    }
}
