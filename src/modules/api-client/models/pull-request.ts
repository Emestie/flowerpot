import { IPullRequest, IResponsePullRequest } from "..";
import { ItemsCommon } from "../../../helpers/ItemsCommon";
import { getConnectionData } from "/@/helpers/Connection";

export function buildPullRequest(resp: IResponsePullRequest, tfsPath: string, collection: string): IPullRequest {
    return {
        id: resp.pullRequestId,
        authorFullName: ItemsCommon.parseNameField(resp.createdBy),
        authorName: ItemsCommon.shortName(ItemsCommon.parseNameField(resp.createdBy)),
        authorUid: resp.createdBy.uniqueName,
        authorAvatar: resp.createdBy.imageUrl,
        authorDescriptor: resp.createdBy.descriptor,
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
        isMine: function () {
            const connectionData = getConnectionData();

            if (!connectionData) return false;

            if (this.authorDescriptor === connectionData.authenticatedUser.subjectDescriptor) return true;

            if (this.reviewers.map((rev) => rev.name).includes(connectionData.authenticatedUser.providerDisplayName))
                return true;

            return false;
        },
        getAuthorTextName: function () {
            return this.authorFullName.split(" <")[0];
        },
    };
}
