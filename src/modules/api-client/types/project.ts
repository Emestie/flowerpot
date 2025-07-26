export interface IResponseProject {
    projects: {
        guid: string;
        name: string;
    }[];
}

export interface IProject {
    accountId: string;
    guid: string;
    name: string;
    collectionName: string;
    path: string;
    enabled: boolean;
}
