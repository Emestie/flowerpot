import { useSelector } from "react-redux";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import { Project } from "../../models/project";
import { ProjectHelper } from "../../helpers/Project";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { useAppStore } from "../../zustand/app";
import { s } from "../../values/Strings";
import { AccountBadge } from "../AccountBadge";

export function ProjectsSettingsTable() {
    const { projects } = useSelector(settingsSelector);

    const openProjectSelector = () => {
        useAppStore.getState().setView("selectprojects");
    };

    const rows = projects.map((project: Project) => (
        <Table.Row key={project.path}>
            <Table.Cell collapsing>
                <Checkbox checked={project.enabled} onChange={() => ProjectHelper.toggleBoolean(project, "enabled")} />
            </Table.Cell>
            <Table.Cell>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <AccountBadge accountId={project.accountId} display="flex" rightGap={4} size="l" />{" "}
                    {project.collectionName}
                </div>
            </Table.Cell>
            <Table.Cell>{project.name}</Table.Cell>
            <Table.Cell collapsing>
                <Button size="tiny" negative icon compact onClick={() => ProjectHelper.delete(project)}>
                    <Icon name="delete" />
                </Button>
            </Table.Cell>
        </Table.Row>
    ));

    return (
        <Table compact celled size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell></Table.HeaderCell>
                    <Table.HeaderCell>{s("collection")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("projectName")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("actions")}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>{rows}</Table.Body>
            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan="6">
                        <Button icon labelPosition="left" primary size="small" onClick={openProjectSelector}>
                            <Icon name="add" /> {s("addProject")}
                        </Button>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}
