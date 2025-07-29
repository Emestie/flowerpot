import { IProject, IQuery, IResponseQuery } from "../types";

export function buildQuery(accountId: string, resp: IResponseQuery, project: IProject): IQuery {
    return {
        accountId,
        collectionName: project.collectionName,
        enabled: true,
        order: 99,
        queryId: resp.id,
        queryName: resp.name,
        queryPath: resp.path,
        teamId: project.guid,
        teamName: project.name,
        ignoreIcon: false,
        ignoreNotif: false,
        isPublic: resp.isPublic,
        nameInList: project.collectionName + " / " + project.name + " / " + resp.path.replaceAll("/", " / "),
    };
}
