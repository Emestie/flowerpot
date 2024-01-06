export interface IResponseQuery {
    children?: IResponseQuery[];
    id: string;
    isFolder: boolean;
    isPublic: boolean;
    name: string;
    path: string;
}

export interface IQuery {
    collectionName: string;
    queryId: string;
    queryName: string;
    queryPath: string;
    teamId: string;
    teamName: string;
    enabled: boolean;
    collapsed: boolean;
    order: number;
    ignoreIcon: boolean;
    ignoreNotif: boolean;
    empty?: boolean;
}
