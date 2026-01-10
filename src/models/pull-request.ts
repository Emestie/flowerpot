import { ItemsCommon } from "../helpers/ItemsCommon";
import Lists from "../helpers/Lists";
import { IResponsePullRequest } from "../modules/api-client";
import { PullRequestReviewer } from "./pull-request-reviewer";
import { getConnectionData } from "/@/helpers/Connection";

export class PullRequest {
    id: number;
    accountId: string;
    isDraft: boolean;
    authorName: string;
    authorFullName: string;
    authorUid: string;
    authorAvatar: string;
    authorDescriptor: string;
    date: string;
    collectionName: string;
    projectName: string;
    repoName: string;
    repoId: string;
    title: string;
    url: string;
    status: string;
    reviewers: PullRequestReviewer[];
    freshness: string;
    sourceBranch: string;
    targetBranch: string;
    labels: { name: string }[];
    mergeStatus: "conflicts" | "succeeded";

    private connectionData: ReturnType<typeof getConnectionData>;

    constructor(resp: IResponsePullRequest, tfsPath: string, collection: string, accountId: string) {
        this.connectionData = getConnectionData(accountId);

        this.id = resp.pullRequestId;
        this.accountId = accountId;
        this.authorFullName = ItemsCommon.parseNameField(resp.createdBy);
        this.authorName = ItemsCommon.shortName(this.authorFullName);
        this.authorUid = resp.createdBy.uniqueName;
        this.authorAvatar = resp.createdBy.imageUrl;
        this.authorDescriptor = resp.createdBy.descriptor;
        this.date = resp.creationDate;
        this.isDraft = resp.isDraft;
        this.collectionName = collection;
        this.projectName = resp.repository.project.name;
        this.repoName = resp.repository.name;
        this.repoId = resp.repository.id;
        this.reviewers = resp.reviewers.map(
            (rev) =>
                new PullRequestReviewer(
                    rev.displayName,
                    rev.uniqueName,
                    rev.imageUrl,
                    !!rev.isRequired,
                    rev.vote,
                    rev.id
                )
        );
        this.status = resp.status;
        this.title = resp.title;
        this.url =
            tfsPath +
            `${collection}/${resp.repository.project.name}/_git/${resp.repository.name}/pullrequest/${resp.pullRequestId}`;
        this.freshness = ItemsCommon.getTerm(resp.creationDate);
        this.sourceBranch = resp.sourceRefName.replace("refs/heads/", "");
        this.targetBranch = resp.targetRefName.replace("refs/heads/", "");
        this.labels = resp.labels || [];
        this.mergeStatus = resp.mergeStatus;
    }

    getBelonging(): null | "author" | "reviewer" | "team" {
        if (!this.connectionData || !this.connectionData.authenticatedUser) return null;

        //if author
        if (this.authorDescriptor === this.connectionData.authenticatedUser.subjectDescriptor) return "author";

        //if in reviewers list as person
        if (this.reviewers.map((rev) => rev.name).includes(this.connectionData.authenticatedUser.providerDisplayName))
            return "reviewer";

        //if member of review group
        if (
            this.reviewers
                .map((rev) => rev.name)
                .some((name) => (this.connectionData?.authenticatedUser.memberOfGroups || []).includes(name))
        )
            return "team";

        return null;
    }

    getAuthorTextName(): string {
        return this.authorFullName.split(" <")[0];
    }

    isAcceptedByMe(): boolean {
        return this.reviewers.some(
            (rev) => this.connectionData?.authenticatedUser.providerDisplayName === rev.name && rev.vote > 0
        );
    }

    isHidden(): boolean {
        return Lists.isPrHidden(this.accountId, this.collectionName, this.id);
    }
}
