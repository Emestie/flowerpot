import { IProject, IResponseProject } from "../types";

export function buildProject(
    accountId: string,
    resp: IResponseProject["projects"][number],
    collectionName: string
): IProject {
    return {
        accountId,
        collectionName,
        guid: resp.guid,
        name: resp.name,
        path: collectionName + "/" + resp.name,
        enabled: true,
    };
}
