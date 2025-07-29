import { useDispatch, useSelector } from "react-redux";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import Query from "../../helpers/Query";
import { appViewSet } from "../../redux/actions/appActions";
import { getQueriesSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { AccountBadge } from "../AccountBadge";

export function QueriesSettingsTable() {
    const dispatch = useDispatch();
    const queries = useSelector(getQueriesSelector(true));

    const openQuerySelector = () => {
        dispatch(appViewSet("selectqueries"));
    };

    const rows = queries.map((q, v, a) => (
        <Table.Row key={q.queryId}>
            <Table.Cell collapsing>
                <Checkbox
                    checked={q.enabled}
                    onChange={() => {
                        Query.toggleBoolean(q, "enabled");
                    }}
                />
            </Table.Cell>
            <Table.Cell>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <AccountBadge accountId={q.accountId} display="flex" rightGap={4} size="l" /> {q.collectionName}
                </div>
            </Table.Cell>
            <Table.Cell>{q.teamName}</Table.Cell>
            <Table.Cell>{q.queryName}</Table.Cell>
            <Table.Cell collapsing>
                <Checkbox
                    checked={q.ignoreIcon}
                    onChange={() => {
                        Query.toggleBoolean(q, "ignoreIcon");
                    }}
                />
            </Table.Cell>
            <Table.Cell collapsing>
                <Checkbox
                    checked={q.ignoreNotif}
                    onChange={() => {
                        Query.toggleBoolean(q, "ignoreNotif");
                    }}
                />
            </Table.Cell>
            <Table.Cell collapsing>
                <Button size="tiny" icon compact disabled={v === 0} onClick={() => Query.move(q, "up")}>
                    <Icon name="arrow up" />
                </Button>
                <Button size="tiny" icon compact disabled={v === a.length - 1} onClick={() => Query.move(q, "dn")}>
                    <Icon name="arrow down" />
                </Button>
                <Button size="tiny" negative icon compact onClick={() => Query.delete(q)}>
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
                    <Table.HeaderCell>{s("teamProject")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("queryName")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("ignoreIcon")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("ignoreNotif")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("actions")}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>{rows}</Table.Body>
            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan="6">
                        <Button icon labelPosition="left" primary size="small" onClick={openQuerySelector}>
                            <Icon name="add" /> {s("addQuery")}
                        </Button>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}
