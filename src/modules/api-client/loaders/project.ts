import { Project } from "../../../models/project";
import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { IResponseProject } from "../types";
import { createCollectionLoaders } from "./collection";

export function createProjectLoaders(params: IApiClientParams, loader: Loader) {
    return {
        async getAll(): Promise<Project[]> {
            const collections = await createCollectionLoaders(loader).getAll();

            const projectsCollections = await Promise.all(
                collections.map((collection) =>
                    loader<IResponseProject>(collection.name + "/_api/_wit/teamProjects?__v=5")
                )
            );

            return projectsCollections.flatMap((pc, index) =>
                pc.projects.map((p) => new Project(params.getAccountId(), p, collections[index].name))
            );
        },
    };
}
