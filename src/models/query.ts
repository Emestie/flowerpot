import { IResponseQuery } from "../modules/api-client/types";
import { Project } from "./project";

export class Query {
    public readonly accountId: string;
    public readonly collectionName: string;
    public enabled: boolean;
    public order: number;
    public readonly queryId: string;
    public readonly queryName: string;
    public readonly queryPath: string;
    public readonly teamId: string;
    public readonly teamName: string;
    public ignoreIcon: boolean;
    public ignoreNotif: boolean;
    public readonly isPublic: boolean;
    public nameInList: string;
    public empty: boolean;

    constructor(accountId: string, resp: IResponseQuery, project: Project) {
        this.accountId = accountId;
        this.collectionName = project.collectionName;
        this.enabled = true;
        this.order = 99;
        this.queryId = resp.id;
        this.queryName = resp.name;
        this.queryPath = resp.path;
        this.teamId = project.guid;
        this.teamName = project.name;
        this.ignoreIcon = false;
        this.ignoreNotif = false;
        this.isPublic = resp.isPublic;
        this.nameInList = project.collectionName + " / " + project.name + " / " + resp.path.replaceAll("/", " / ");
        this.empty = false;
    }
}
