import { IPullRequest, IResponsePullRequest } from "..";
import { ItemsCommon } from "../../../helpers/ItemsCommon";
import { getConnectionData } from "/@/helpers/Connection";

export function buildPullRequest(resp: IResponsePullRequest, tfsPath: string, collection: string): IPullRequest {
    const connectionData = getConnectionData();

    return {
        id: resp.pullRequestId,
        authorFullName: ItemsCommon.parseNameField(resp.createdBy),
        authorName: ItemsCommon.shortName(ItemsCommon.parseNameField(resp.createdBy)),
        authorUid: resp.createdBy.uniqueName,
        authorAvatar: resp.createdBy.imageUrl,
        authorDescriptor: resp.createdBy.descriptor,
        date: resp.creationDate,
        isDraft: resp.isDraft,
        collectionName: collection,
        projectName: resp.repository.project.name,
        repoName: resp.repository.name,
        repoId: resp.repository.id,
        reviewers: resp.reviewers.map((rev) => ({
            name: rev.displayName,
            uid: rev.uniqueName,
            imageUrl: rev.imageUrl,
            isRequired: !!rev.isRequired,
            vote: rev.vote,
            id: rev.id,
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
        getBelonging: function () {
            if (!connectionData) return null;

            //if author
            if (this.authorDescriptor === connectionData.authenticatedUser.subjectDescriptor) return "author";

            //if in reviewers list as person
            if (this.reviewers.map((rev) => rev.name).includes(connectionData.authenticatedUser.providerDisplayName))
                return "reviewer";

            //if member of review group
            if (
                this.reviewers
                    .map((rev) => rev.name)
                    .some((name) => (connectionData.authenticatedUser.memberOfGroups || []).includes(name))
            )
                return "team";

            return null;
        },
        getAuthorTextName: function () {
            return this.authorFullName.split(" <")[0];
        },
        isAcceptedByMe: function () {
            return this.reviewers.some(
                (rev) => connectionData?.authenticatedUser.providerDisplayName === rev.name && rev.vote > 0
            );
        },
    };
}
