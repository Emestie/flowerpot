import React from "react";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import store from "../store-mbx";
import Query from "../helpers/Query";
import { observer } from "mobx-react";
import { s } from "../values/Strings";

@observer
export default class QueriesSettingsTable extends React.Component {
    openQuerySelector = () => {
        store.switchView("selectqueries");
    };

    render() {
        let queries = store.getQueries(true);

        let rows = queries.map((q, v, a) => (
            <Table.Row key={q.queryId}>
                <Table.Cell collapsing>
                    <Checkbox
                        checked={q.enabled}
                        onChange={() => {
                            Query.toggleBoolean(q, "enabled");
                        }}
                    />
                </Table.Cell>
                <Table.Cell>{q.collectionName}</Table.Cell>
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
                            <Button icon labelPosition="left" primary size="small" onClick={this.openQuerySelector}>
                                <Icon name="add" /> {s("addQuery")}
                            </Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        );
    }
}
