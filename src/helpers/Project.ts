import { Project } from "../models/project";
import { useSettingsStore } from "../zustand/settings";

type TBoolProps = "enabled";

export class ProjectHelper {
    public static add(project: Project) {
        const allProjects = useSettingsStore.getState().projects;
        allProjects.push(project);
        this.updateAllInStore(allProjects);
    }

    public static delete(project: Project) {
        const allProjects = useSettingsStore.getState().projects.filter((p) => p.path !== project.path);
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
        let exactQueryIndex = useSettingsStore.getState().projects.findIndex((p) => p.path === project.path);
        return exactQueryIndex;
    }

    private static updateSingleInStore(project: Project) {
        const allQueries = useSettingsStore.getState().projects;
        const index = this.findIndex(project);
        allQueries[index] = project;
        this.updateAllInStore(allQueries);
    }

    private static updateAllInStore(projects: Project[]) {
        useSettingsStore.getState().setProjects(projects);
    }
}
