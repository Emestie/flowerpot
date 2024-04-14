import { Loader } from "../loader";
import { buildQuery } from "../models";
import { IProject, IQuery, IResponseQuery, IValue } from "../types";
import { createProjectLoaders } from "./project";

export function createQueryLoaders(loader: Loader) {
    return {
        async getAvailable(): Promise<IQuery[]> {
            const projects = await createProjectLoaders(loader).getAll();

            const queryCollection = await Promise.all(
                projects.map((project) =>
                    loader<IValue<IResponseQuery[]>>(
                        project.collectionName + "/" + project.guid + "/_apis/wit/queries?$depth=2&api-version=5.1"
                    )
                )
            );

            const allQueries = queryCollection
                .flatMap((qc, index) => qc.value.flatMap((v) => pullOutAllQueries(v, projects[index])))
                .sort((a, b) => (a.nameInList < b.nameInList ? -1 : 1));

            return allQueries;
        },
    };
}

function pullOutAllQueries(rq: IResponseQuery, project: IProject): IQuery[] {
    if (!rq.isPublic && rq.isFolder) console.log(rq);
    if (rq.isFolder) {
        return (rq.children || []).flatMap((crq) => pullOutAllQueries(crq, project));
    }

    return [buildQuery(rq, project)];
}
