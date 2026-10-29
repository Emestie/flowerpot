interface IAuthenticatedUser {
    id: string;
    subjectDescriptor: string;
    providerDisplayName: string;
    isActive: boolean;
    properties: {
        Account?: {
            $type: string;
            $value: string;
        };
        /** Azure DevOps Services uses a lowercase key */
        account?: {
            $type: string;
            $value: string;
        };
    };
    resourceVersion: number;
    metaTypeId: number;
    /**display names of every group the user belongs to, nested ones included*/
    memberOfGroups?: string[];
    /**identity ids of the same groups — stable when display names differ*/
    memberOfGroupIds?: string[];
}

export interface IConnectionData {
    authenticatedUser: IAuthenticatedUser;
    authorizedUser?: IAuthenticatedUser;
    /** "hosted" on Azure DevOps Services, "onprem" (or absent) on Azure DevOps Server */
    deploymentType?: string;
    instanceId?: string;
    deploymentId?: string;
    locationServiceData?: {
        serviceOwner?: string;
        defaultAccessMappingMoniker?: string;
        lastChangeId?: number;
        lastChangeId64?: number;
        accessMappings?: unknown[];
        serviceDefinitions?: unknown[];
    };
}

export interface IIdentityMembership {
    value?: { id: string; providerDisplayName: string; memberOf: string[] }[];
}
