import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { Table } from "../../ui/table";
import { Toggle } from "../../ui/toggle";
import CloudAdo from "../../helpers/CloudAdo";
import { Project } from "../../models/project";
import { ProjectHelper } from "../../helpers/Project";
import { useSettingsStore } from "../../zustand/settings";
import { useAppStore } from "../../zustand/app";
import { s } from "../../values/Strings";
import { AccountBadge } from "../AccountBadge";

export function ProjectsSettingsTable() {
    const projects = useSettingsStore((state) => state.projects) || [];
    const accounts = useSettingsStore((state) => state.accounts);

    const openProjectSelector = () => {
        useAppStore.getState().setView("selectprojects");
    };

    const rows = projects.map((project: Project) => (
        <Table.Row key={project.path}>
            <Table.Cell collapsing>
                <Toggle
                    checked={project.enabled}
                    ariaLabel={s("enabled")}
                    onChange={() => ProjectHelper.toggleBoolean(project, "enabled")}
                />
            </Table.Cell>
            <Table.Cell>
                <div className="collection-badge-row">
                    <AccountBadge accountId={project.accountId} display="flex" rightGap={4} size="l" />{" "}
                    {CloudAdo.getCollectionDisplayName(
                        accounts.find((a) => a.id === project.accountId)?.url,
                        project.collectionName
                    )}
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
                    <Table.HeaderCell colSpan={6}>
                        <Button icon labelPosition="left" primary size="small" onClick={openProjectSelector}>
                            <Icon name="add" /> {s("addProject")}
                        </Button>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}
