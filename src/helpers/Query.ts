export interface IQuery {
    queryId: string;
    queryName: string;
    teamId: string;
    teamName: string;
    enabled: boolean;
    collapsed: boolean;
    order: number;
}

export default class Query {
    //! after any operation update queries array in store

    public static addQuery(query: IQuery) {}

    public static deleteQuery(query: IQuery) {}

    public static toggleQuery(query: IQuery) {}

    public static moveQuery(query: IQuery, direction: "up" | "dn") {}
}
