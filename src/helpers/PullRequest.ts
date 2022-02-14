import { store } from "../redux/store";
import { ItemsCommon } from "./ItemsCommon";

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
    reviewers: { name: string; uid: string }[];
    freshness: string;
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
    }[];
    _collection: string;
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
            reviewers: resp.reviewers.map((rev) => ({ name: rev.displayName, uid: rev.uniqueName })),
            status: resp.status,
            title: resp.title,
            url:
                store.getState().settings.tfsPath +
                `${resp._collection}/${resp.repository.project.name}/_git/${resp.repository.name}/pullrequest/${resp.pullRequestId}`,
            freshness: ItemsCommon.getTerm(resp.creationDate),
        };
    }
}
