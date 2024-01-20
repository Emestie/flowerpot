import { IProject, IResponseProject } from "../types";

export function buildProject(resp: IResponseProject["projects"][number], collectionName: string): IProject {
    return {
        collectionName,
        guid: resp.guid,
        name: resp.name,
        path: collectionName + "/" + resp.name,
        enabled: true,
    };
}
