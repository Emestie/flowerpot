import { Loader } from "../loader";
import { buildProject } from "../models";
import { IProject, IResponseProject } from "../types";
import { createCollectionLoaders } from "./collection";

export function createProjectLoaders(loader: Loader) {
    return {
        async getAll(): Promise<IProject[]> {
            const collections = await createCollectionLoaders(loader).getAll();

            const projectsCollections = await Promise.all(
                collections.map((collection) =>
                    loader<IResponseProject>(collection.name + "/_api/_wit/teamProjects?__v=5")
                )
            );

            return projectsCollections.flatMap((pc, index) =>
                pc.projects.map((p) => buildProject(p, collections[index].name))
            );
        },
    };
}
