import React from "react";
import { Header, Container, Button, Form, Input, DropdownProps, DropdownItemProps, Label, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import QueryTable from "../components/QueryTable";

const avatar = require("../assets/ti.jpg") as string;

interface IProps {}
interface IState {}

@observer
export default class SettingsView extends React.Component<IProps, IState> {
    refreshRates: DropdownItemProps[] = [
        { text: "1 minute", value: 60 },
        { text: "5 minutes", value: 300 },
        { text: "10 minutes", value: 600 },
        { text: "30 minutes", value: 1800 },
    ];

    openCreds = () => {
        store.switchView("credentials");
    };

    onRateSelect(val: number) {
        store.settings.refreshRate = val;
    }

    onSave = () => {
        store.switchView("main");
    };

    render() {
        return (
            <div className="Page">
                <div className="TopBar">
                    <Header as="h1">Settings</Header>
                    <div className="RightTopCorner">
                        <Button onClick={this.openCreds}>Edit TFS & Account settings</Button>
                        <Button positive onClick={this.onSave}>
                            Save
                        </Button>
                    </div>
                </div>
                <Container fluid>
                    <Header as="h3" dividing>
                        Refresh rate
                    </Header>
                    <Form.Select
                        label="Queries refresh rate: "
                        options={this.refreshRates}
                        value={store.settings.refreshRate}
                        onChange={(e, { value }) => this.onRateSelect(value as number)}
                    />
                    <Header as="h3" dividing>
                        Queries to watch
                    </Header>
                    <QueryTable />
                    <Header as="h3" dividing>
                        Credits
                    </Header>
                    <Label image>
                        <img src={avatar} />
                        Valery Murashko
                        <Label.Detail>did it!</Label.Detail>
                    </Label>
                    <Label>
                        Version
                        <Label.Detail>//TODO: 0.1.0.20190906-092600</Label.Detail>
                    </Label>
                    <Label as="a">
                        <Icon name="github" />
                        github.com/Emestie/flowerpot
                    </Label>
                </Container>
            </div>
        );
    }
}
