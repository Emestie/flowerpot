interface Author {
    displayName: string;
    url: string;
    _links: {
        avatar: {
            href: string;
        };
    };
    id: string;
    uniqueName: string;
    imageUrl: string;
    descriptor: string;
}

interface Comment {
    id: number;
    parentCommentId: number;
    author: Author;
    content: string;
    publishedDate: string;
    lastUpdatedDate: string;
    lastContentUpdatedDate: string;
    commentType: string;
    usersLiked: any[];
    _links: {
        self: {
            href: string;
        };
        repository: {
            href: string;
        };
        threads: {
            href: string;
        };
        pullRequests: {
            href: string;
        };
    };
}

interface Property {
    $type: string;
    $value: any;
}

interface Properties {
    CodeReviewThreadType: Property;
    CodeReviewReviewersUpdatedNumAdded: Property;
    CodeReviewReviewersUpdatedNumRemoved: Property;
    CodeReviewReviewersUpdatedNumChanged: Property;
    CodeReviewReviewersUpdatedNumDeclined: Property;
    CodeReviewReviewersUpdatedAddedIdentity: Property;
    CodeReviewReviewersUpdatedByIdentity: Property;
}

interface Identity {
    displayName: string;
    url: string;
    _links: {
        avatar: {
            href: string;
        };
    };
    id: string;
    uniqueName: string;
    imageUrl: string;
    descriptor: string;
}

export interface IPullRequestThread {
    pullRequestThreadContext?: any;
    id: number;
    publishedDate: string;
    lastUpdatedDate: string;
    comments: Comment[];
    threadContext?: any;
    properties: Properties;
    identities: { [key: string]: Identity };
    isDeleted: boolean;
    status: string | undefined;
    _links: {
        self: {
            href: string;
        };
        repository: {
            href: string;
        };
    };
}
