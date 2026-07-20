import { Header } from "../../../ui/header";
import { ProjectsSettingsTable } from "../../../components/tables/ProjectsSettingsTable";
import { s } from "../../../values/Strings";

export function ProjectsSection() {
    return (
        <>
            <Header as="h3" dividing>
                {s("projectsTableSettingsHeader")}
            </Header>
            <ProjectsSettingsTable />
        </>
    );
}
