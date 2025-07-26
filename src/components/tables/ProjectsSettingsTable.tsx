import { useDispatch, useSelector } from "react-redux";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import { Project } from "../../helpers/Project";
import { appViewSet } from "../../redux/actions/appActions";
import { getProjectsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { AccountBadge } from "../AccountBadge";

export function ProjectsSettingsTable() {
    const dispatch = useDispatch();
    const projects = useSelector(getProjectsSelector(true));

    const openProjectSelector = () => {
        dispatch(appViewSet("selectprojects"));
    };

    const rows = projects.map((project) => (
        <Table.Row key={project.path}>
            <Table.Cell collapsing>
                <Checkbox checked={project.enabled} onChange={() => Project.toggleBoolean(project, "enabled")} />
            </Table.Cell>
            <Table.Cell>
                <AccountBadge accountId={project.accountId} /> {project.collectionName}
            </Table.Cell>
            <Table.Cell>{project.name}</Table.Cell>
            <Table.Cell collapsing>
                <Button size="tiny" negative icon compact onClick={() => Project.delete(project)}>
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
