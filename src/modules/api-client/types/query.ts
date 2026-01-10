import { Errorful } from "./common";

export interface IResponseQuery {
    children?: IResponseQuery[];
    id: string;
    isFolder: boolean;
    isPublic: boolean;
    name: string;
    path: string;
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
