import { Project } from "../models/project";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { getProjectsSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";

type TBoolProps = "enabled";

export class ProjectHelper {
    public static add(project: Project) {
        const allProjects = getProjectsSelector(true)(store.getState());
        allProjects.push(project);
        this.updateAllInStore(allProjects);
    }

    public static delete(project: Project) {
        const allProjects = getProjectsSelector(true)(store.getState()).filter((p) => p.path !== project.path);
        this.updateAllInStore(allProjects);
    }

    public static toggleBoolean(project: Project, boolPropName: TBoolProps, forcedValue?: boolean) {
        if (forcedValue === undefined) {
            project[boolPropName] = !project[boolPropName];
        } else {
            project[boolPropName] = forcedValue;
        }
        this.updateSingleInStore(project);
    }

    private static findIndex(project: Project) {
        let exactQueryIndex = getProjectsSelector(true)(store.getState()).findIndex((p) => p.path === project.path);
        return exactQueryIndex;
    }

    private static updateSingleInStore(project: Project) {
        const allQueries = getProjectsSelector(true)(store.getState());
        const index = this.findIndex(project);
        allQueries[index] = project;
        this.updateAllInStore(allQueries);
    }

    private static updateAllInStore(projects: Project[]) {
        store.dispatch(settingsUpdate({ projects }));
    }
}
