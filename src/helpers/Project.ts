import { IProject as IProject_ } from "../modules/api-client";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { getProjectsSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";

export interface IProject extends IProject_ {
    collectionName: string;
    name: string;
    path: string;
    enabled: boolean;
}

type TBoolProps = "enabled";

export class Project {
    public static add(project: IProject) {
        const allProjects = getProjectsSelector(true)(store.getState());
        allProjects.push(project);
        this.updateAllInStore(allProjects);
    }

    public static delete(project: IProject) {
        const allProjects = getProjectsSelector(true)(store.getState()).filter((p) => p.path !== project.path);
        this.updateAllInStore(allProjects);
    }

    public static toggleBoolean(project: IProject, boolPropName: TBoolProps, forcedValue?: boolean) {
        if (forcedValue === undefined) {
            project[boolPropName] = !project[boolPropName];
        } else {
            project[boolPropName] = forcedValue;
        }
        this.updateSingleInStore(project);
    }

    private static findIndex(project: IProject) {
        let exactQueryIndex = getProjectsSelector(true)(store.getState()).findIndex((p) => p.path === project.path);
        return exactQueryIndex;
    }

    private static updateSingleInStore(project: IProject) {
        const allQueries = getProjectsSelector(true)(store.getState());
        const index = this.findIndex(project);
        allQueries[index] = project;
        this.updateAllInStore(allQueries);
    }

    private static updateAllInStore(projects: IProject[]) {
        store.dispatch(settingsUpdate({ projects }));
    }
}
