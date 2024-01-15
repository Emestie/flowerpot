import { Errorful } from "./common";

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

interface IQueryResultWorkItem {
    id: number;
    url: string;
}

export interface IQueryResult extends Errorful {
    queryType: string;
    queryResultType: string;
    workItems: IQueryResultWorkItem[];
    workItemRelations: {
        target: IQueryResultWorkItem;
    }[];
}
