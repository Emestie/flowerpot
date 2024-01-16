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
}

export interface IConnectionData {
    authenticatedUser: IAuthenticatedUser;
}
