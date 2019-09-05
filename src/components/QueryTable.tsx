import React from "react";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";

const QueryTable = () => (
    <Table compact celled definition>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>Show</Table.HeaderCell>
                <Table.HeaderCell>Team project</Table.HeaderCell>
                <Table.HeaderCell>Query name</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
        </Table.Header>

        <Table.Body>
            <Table.Row>
                <Table.Cell collapsing>
                    <Checkbox toggle />
                </Table.Cell>
                <Table.Cell>Delo96</Table.Cell>
                <Table.Cell>What Have I Done</Table.Cell>
                <Table.Cell collapsing>
                    <Button size="tiny" icon compact>
                        <Icon name="arrow up" />
                    </Button>
                    <Button size="tiny" icon compact>
                        <Icon name="arrow down" />
                    </Button>
                    <Button size="tiny" negative icon compact>
                        <Icon name="delete" />
                    </Button>
                </Table.Cell>
            </Table.Row>
        </Table.Body>

        <Table.Footer fullWidth>
            <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell colSpan="4">
                    <Button icon labelPosition="left" primary size="small">
                        <Icon name="add" /> Add Query
                    </Button>
                </Table.HeaderCell>
            </Table.Row>
        </Table.Footer>
    </Table>
);

export default QueryTable;
