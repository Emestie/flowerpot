import React from "react";
import { Header, Container, Button, Form, DropdownItemProps, Label, Icon, DropdownProps } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import QueriesSettingsTable from "../components/QueriesSettingsTable";
import Electron from "../helpers/Electron";
import { TSortPattern, TNotificationsMode } from "../helpers/Settings";

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

    sortPatterns: DropdownItemProps[] = [
        { key: 1, text: "Weight -> Date", value: "default" },
        { key: 2, text: '"Assigned To" Name -> Date', value: "assignedto" },
        { key: 3, text: "ID", value: "id" }
    ];

    notificationsModes: DropdownItemProps[] = [
        { key: 1, text: "All", value: "all" },
        { key: 2, text: "Mine only", value: "mine" },
        { key: 3, text: "None", value: "none" }
    ];

    openCreds = () => {
        store.switchView("credentials");
    };

    onRateSelect(val: number) {
        store.settings.refreshRate = val;
    }

    onSortSelect(val: TSortPattern) {
        store.settings.sortPattern = val;
    }

    onNotifModeSelect(val: TNotificationsMode) {
        store.settings.notificationsMode = val;
    }

    toggleAutostart = () => {
        store.autostart = !store.autostart;
    };

    toggleIconColor = () => {
        store.settings.iconChangesOnMyWorkItemsOnly = !store.settings.iconChangesOnMyWorkItemsOnly;
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
                    <QueriesSettingsTable />
                    <Form.Select
                        label="Sort pattern: "
                        options={this.sortPatterns}
                        value={store.settings.sortPattern}
                        onChange={(e, { value }) => this.onSortSelect(value as TSortPattern)}
                    />
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
                    <Form.Select
                        label="Show notifications: "
                        options={this.notificationsModes}
                        value={store.settings.notificationsMode}
                        onChange={(e, { value }) => this.onNotifModeSelect(value as TNotificationsMode)}
                    />
                    <br />
                    <Form.Checkbox
                        label="Change app icon color only on my Work Items events"
                        checked={store.settings.iconChangesOnMyWorkItemsOnly}
                        onChange={this.toggleIconColor}
                    />
                    <br />
                    <Form.Checkbox
                        label="Start with Windows (applies on app restart)"
                        checked={store.autostart}
                        onChange={this.toggleAutostart}
                    />
                    <br />
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
