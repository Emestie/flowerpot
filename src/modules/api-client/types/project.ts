export interface IResponseProject {
    projects: {
        guid: string;
        name: string;
    }[];
}

export interface IProject {
    guid: string;
    name: string;
    collectionName: string;
    path: string;
}
