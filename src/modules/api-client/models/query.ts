import { IProject, IQuery, IResponseQuery } from "../types";

export function buildQuery(resp: IResponseQuery, project: IProject): IQuery {
    return {
        collectionName: project.collectionName,
        collapsed: false,
        enabled: true,
        order: 99,
        queryId: resp.id,
        queryName: resp.name,
        queryPath: resp.path,
        teamId: project.guid,
        teamName: project.name, //todo: put here project itself maybe
        ignoreIcon: false,
        ignoreNotif: false,
    };
}
