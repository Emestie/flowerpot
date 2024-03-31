interface IAuthenticatedUser {
    id: string;
    subjectDescriptor: string;
    providerDisplayName: string;
    isActive: boolean;
    properties: {
        Account: {
            $type: string;
            $value: string;
        };
    };
    resourceVersion: number;
    metaTypeId: number;
    memberOfGroups?: string[];
}

export interface IConnectionData {
    authenticatedUser: IAuthenticatedUser;
}

export interface IIdentityMembership {
    value: { id: string; providerDisplayName: string; memberOf: string[] }[];
}
