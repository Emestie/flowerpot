import { IResponseProject } from "../modules/api-client/types";

export class Project {
    accountId: string;
    guid: string;
    name: string;
    collectionName: string;
    path: string;
    enabled: boolean;

    constructor(accountId: string, resp: IResponseProject["projects"][number], collectionName: string) {
        this.accountId = accountId;
        this.collectionName = collectionName;
        this.guid = resp.guid;
        this.name = resp.name;
        this.path = collectionName + "/" + resp.name;
        this.enabled = true;
    }
}
