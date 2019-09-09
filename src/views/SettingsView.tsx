import React from "react";
import { Header, Container, Button, Form, DropdownItemProps, Label, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import QueryTable from "../components/QueryTable";
import Electron from "../helpers/Electron";

const avatar = require("../assets/ti.jpg") as string;

interface IProps {}
interface IState {
    updateInstallInProgress: boolean;
}

@observer
export default class SettingsView extends React.Component<IProps, IState> {
    state: IState = {
        updateInstallInProgress: false
    };

    refreshRates: DropdownItemProps[] = [
        { key: 1, text: "1 minute", value: 60 },
        { key: 2, text: "5 minutes", value: 300 },
        { key: 3, text: "10 minutes", value: 600 }
    ];

    openCreds = () => {
        store.switchView("credentials");
    };

    onRateSelect(val: number) {
        store.settings.refreshRate = val;
    }

    toggleNotif = () => {
        store.settings.showNotifications = !store.settings.showNotifications;
    };

    toggleAutostart = () => {
        store.autostart = !store.autostart;
    };

    onSave = () => {
        store.switchView("main");
    };

    onUpdate = () => {
        this.setState({ updateInstallInProgress: true });
        Electron.updateApp();
    };

    render() {
        if (Electron.isDev()) {
            if (this.refreshRates.length !== 4) this.refreshRates.push({ key: Math.random(), text: "(debug) 10 seconds", value: 10 });
        }

        let updateLabel = undefined;

        switch (store.updateStatus) {
            case "checking":
                updateLabel = <Label>Checking for updates...</Label>;
                break;
            case "downloading":
                updateLabel = <Label color="teal">Downloading update...</Label>;
                break;
            case "ready":
                updateLabel = (
                    <Label as="a" color="green" onClick={() => this.onUpdate()}>
                        Update ready. Click to install
                    </Label>
                );
                break;
            default:
                updateLabel = (
                    <Label as="a" onClick={() => Electron.checkForUpdates()}>
                        Check for updates
                    </Label>
                );
        }

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
                        Queries to watch
                    </Header>
                    <QueryTable />
                    <Header as="h3" dividing>
                        Other settings
                    </Header>
                    <Form.Select
                        label="Queries refresh rate: "
                        options={this.refreshRates}
                        value={store.settings.refreshRate}
                        onChange={(e, { value }) => this.onRateSelect(value as number)}
                    />
                    <br />
                    <Form.Checkbox label="Add to Windows startup" checked={store.autostart} onChange={this.toggleAutostart} />
                    <br />
                    <Form.Checkbox label="Show notifications" checked={store.settings.showNotifications} onChange={this.toggleNotif} />
                    <Header as="h3" dividing>
                        Credits
                    </Header>
                    <Label as="a" image onClick={() => Electron.openUrl("https://github.com/Emestie/flowerpot")}>
                        <img src={avatar} alt="" />
                        <Icon name="github" />
                        Emestie/flowerpot
                    </Label>
                    <Label>
                        Version
                        <Label.Detail>{Electron.getVer()}</Label.Detail>
                    </Label>
                    {updateLabel}
                </Container>
            </div>
        );
    }
}
