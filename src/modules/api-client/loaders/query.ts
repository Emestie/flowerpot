import { Loader } from "../loader";
import { buildQuery } from "../models";
import { IQuery, IResponseQuery, IValue } from "../types";
import { createProjectLoaders } from "./project";

export function createQueryLoaders(loader: Loader) {
    return {
        async getAvailable(): Promise<IQuery[]> {
            const projects = await createProjectLoaders(loader).getAll();

            const queryCollection = await Promise.all(
                projects.map((project) =>
                    loader<IValue<IResponseQuery[]>>(
                        project.collectionName + "/" + project.guid + "/_apis/wit/queries?$depth=2&api-version=5.1",
                    ),
                ),
            );

            const allQueries = queryCollection.flatMap((qc, index) =>
                qc.value.flatMap((v) =>
                    (v.children || [])
                        .filter((rq) => !rq.isPublic && !rq.isFolder)
                        .map((rq) => buildQuery(rq, projects[index])),
                ),
            );

            return allQueries;
        },
    };
}
