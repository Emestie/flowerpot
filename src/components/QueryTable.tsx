import React from "react";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import store from "../store";
import Query from "../helpers/Query";
import { observer } from "mobx-react";

@observer
export default class QueryTable extends React.Component {
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
                            Query.toggleEnability(q);
                        }}
                    />
                </Table.Cell>
                <Table.Cell>{q.teamName}</Table.Cell>
                <Table.Cell>{q.queryName}</Table.Cell>
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
            <Table compact celled definition>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell></Table.HeaderCell>
                        <Table.HeaderCell>Team project</Table.HeaderCell>
                        <Table.HeaderCell>Query name</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>{rows}</Table.Body>
                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell colSpan="4">
                            <Button icon labelPosition="left" primary size="small" onClick={this.openQuerySelector}>
                                <Icon name="add" /> Add Query
                            </Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        );
    }
}
