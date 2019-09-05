import React from "react";
import { Header, Container, Button, Form, Input, DropdownProps, DropdownItemProps, Label } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import QueryTable from "../components/QueryTable";

interface IProps {}
interface IState {}

@observer
export default class SettingsView extends React.Component<IProps, IState> {
    state: IState = {};

    refreshRates: DropdownItemProps[] = [
        { text: "1 minute", value: 60 },
        { text: "5 minutes", value: 300 },
        { text: "10 minutes", value: 600 },
        { text: "30 minutes", value: 1800 }
    ];

    openCreds = () => {
        store.switchView("credentials");
    };

    onRateSelect(val: number) {
        store.settings.refreshRate = val;
    }

    render() {
        return (
            <div className="Page">
                <div className="RightTopCorner">
                    <Button onClick={this.openCreds}>Edit TFS & Account settings</Button>
                    <Button positive>Save</Button>
                </div>
                <Container fluid>
                    <Header as="h1">Settings</Header>
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
                    Flower Pot (c) 2019 Me.
                </Container>
            </div>
        );
    }
}
