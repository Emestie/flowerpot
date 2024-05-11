import { Loader } from "../loader";
import { buildQuery } from "../models";
import { IProject, IQuery, IResponseQuery, IValue } from "../types";
import { createProjectLoaders } from "./project";
import { s } from "/@/values/Strings";

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
        async getByUrl(urlToQuery: string): Promise<IQuery> {
            if (!urlToQuery.includes("_queries/query")) throw new Error(s("queryByUrlError1"));

            let urlToLoad = urlToQuery.replace("_queries/query", "_apis/wit/queries");
            if (urlToLoad.at(-1) === "/") urlToLoad = urlToLoad.slice(0, -1);

            const queryData = await loader<IResponseQuery>(urlToLoad);

            if (!queryData) throw new Error(s("queryByUrlError2"));

            const projectName = urlToLoad.split("/_apis/").at(0)?.split("/").at(-1);
            const projects = await createProjectLoaders(loader).getAll();
            const project = projects.find((p) => p.name === projectName);

            if (!project) throw new Error(s("queryByUrlError3"));

            return buildQuery(queryData, project);
        },
    };
}

function pullOutAllQueries(rq: IResponseQuery, project: IProject): IQuery[] {
    if (rq.isFolder) {
        return (rq.children || []).flatMap((crq) => pullOutAllQueries(crq, project));
    }

    return [buildQuery(rq, project)];
}
