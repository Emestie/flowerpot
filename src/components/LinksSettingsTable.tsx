import React from "react";
import { Button, Checkbox, Icon, Label, Radio, Table } from "semantic-ui-react";
import store from "../store";
import { observer } from "mobx-react";
import { s } from "../values/Strings";
import Links from "../helpers/Links";
import ColorPicker from "./ColorPicker";

export default observer(() => {
    const links = store.settings.links.sort((a, b) => (a.order || 0) - (b.order || 0));

    const addLink = () => {
        store.dialogs.addLink = true;
    };

    const rows = links.map((link, v, a) => (
        <Table.Row key={link.url + link.name + link.order}>
            <Table.Cell>{link.name}</Table.Cell>
            <Table.Cell>{link.url}</Table.Cell>
            <Table.Cell>
                <ColorPicker
                    value={link.color}
                    onPick={(c) => {
                        Links.updateColor(link, c);
                    }}
                />
            </Table.Cell>
            <Table.Cell collapsing>
                <Button
                    size="tiny"
                    icon
                    compact
                    disabled={v === 0}
                    onClick={() => {
                        Links.move(link, "up");
                    }}
                >
                    <Icon name="arrow up" />
                </Button>
                <Button
                    size="tiny"
                    icon
                    compact
                    disabled={v === a.length - 1}
                    onClick={() => {
                        Links.move(link, "dn");
                    }}
                >
                    <Icon name="arrow down" />
                </Button>
                <Button
                    size="tiny"
                    negative
                    icon
                    compact
                    onClick={() => {
                        Links.delete(link);
                    }}
                >
                    <Icon name="delete" />
                </Button>
            </Table.Cell>
        </Table.Row>
    ));

    return (
        <Table compact celled size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>{s("linkName")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("linkUrl")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("linkColor")}</Table.HeaderCell>
                    <Table.HeaderCell>{s("actions")}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>{rows}</Table.Body>
            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.HeaderCell colSpan="6">
                        <Button disabled={links.length > 4} icon labelPosition="left" primary size="small" onClick={addLink}>
                            <Icon name="add" /> {s("addLink")}
                        </Button>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
});
