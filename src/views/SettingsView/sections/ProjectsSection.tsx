import { Header } from "semantic-ui-react";
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
