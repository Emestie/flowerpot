import { Project } from "../models/project";
import { useSettingsStore } from "../zustand/settings";

type TBoolProps = "enabled";

export class ProjectHelper {
    public static add(project: Project) {
        const allProjects = useSettingsStore.getState().projects;
        this.updateAllInStore([...allProjects, project]);
    }

    public static delete(project: Project) {
        const allProjects = useSettingsStore.getState().projects.filter((p) => p.path !== project.path);
        this.updateAllInStore(allProjects);
    }

    public static toggleBoolean(project: Project, boolPropName: TBoolProps, forcedValue?: boolean) {
        const newBool = forcedValue !== undefined ? forcedValue : !project[boolPropName];
        const updatedProject = { ...project, [boolPropName]: newBool };
        const allProjects = useSettingsStore.getState().projects;
        const index = allProjects.findIndex((p) => p.path === project.path);
        const updatedProjects = [...allProjects];
        updatedProjects[index] = updatedProject;
        this.updateAllInStore(updatedProjects);
    }

    private static findIndex(project: Project) {
        return useSettingsStore.getState().projects.findIndex((p) => p.path === project.path);
    }

    private static updateAllInStore(projects: Project[]) {
        useSettingsStore.getState().setProjects(projects);
    }
}
