import React from "react";
import { Header, Container, Button, Form, DropdownItemProps, Label, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import store, { TLocale } from "../store";
import QueriesSettingsTable from "../components/QueriesSettingsTable";
import Electron from "../helpers/Electron";
import { TSortPattern, TNotificationsMode } from "../helpers/Settings";
import { s } from "../values/Strings";
import LocalVersionBanner from "../components/LocalVersionBanner";

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
        { key: 1, text: s("refresh1m"), value: 60 },
        { key: 2, text: s("refresh3m"), value: 180 },
        { key: 3, text: s("refresh5m"), value: 300 },
        { key: 4, text: s("refresh10m"), value: 600 }
    ];

    sortPatterns: DropdownItemProps[] = [
        { key: 1, text: s("sortPatternWeight"), value: "default" },
        { key: 2, text: s("sortPatternAssigned"), value: "assignedto" },
        { key: 3, text: s("sortPatternId"), value: "id" }
    ];

    notificationsModes: DropdownItemProps[] = [
        { key: 1, text: s("notifModeAll"), value: "all" },
        { key: 2, text: s("notifModeMine"), value: "mine" },
        { key: 3, text: s("notifModeNone"), value: "none" }
    ];

    locales: DropdownItemProps[] = [{ key: 2, text: s("localeEn"), value: "en" }, { key: 3, text: s("localeRu"), value: "ru" }];

    openCreds = () => {
        store.switchView("credentials");
    };

    onRateSelect(val: number) {
        store.settings.refreshRate = val;
        store.updateSettings();
    }

    onSortSelect(val: TSortPattern) {
        store.settings.sortPattern = val;
        store.updateSettings();
    }

    onNotifModeSelect(val: TNotificationsMode) {
        store.settings.notificationsMode = val;
        store.updateSettings();
    }

    onLocaleSelect(val: TLocale) {
        store.locale = val;
    }

    toggleAutostart = () => {
        store.autostart = !store.autostart;
    };

    toggleIconColor = () => {
        store.settings.iconChangesOnMyWorkItemsOnly = !store.settings.iconChangesOnMyWorkItemsOnly;
        store.updateSettings();
    };

    toggleMineOnTop = () => {
        store.settings.mineOnTop = !store.settings.mineOnTop;
        store.updateSettings();
    };

    toggleTheme = () => {
        store.settings.darkTheme = !store.settings.darkTheme;
        store.updateSettings();
    };

    toggleTelemetry = () => {
        store.settings.allowTelemetry = !store.settings.allowTelemetry;
        store.updateSettings();
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
            if (this.refreshRates.length !== 5) this.refreshRates.push({ key: Math.random(), text: s("refreshdebug"), value: 10 });
        }

        let updateLabel = undefined;

        switch (store.updateStatus) {
            case "checking":
                updateLabel = <Label>{s("updateStateChecking")}</Label>;
                break;
            case "downloading":
                updateLabel = <Label color="teal">{s("updateStateDownloading")}</Label>;
                break;
            case "ready":
                //TODO: button here and updateInstallInProgress
                updateLabel = (
                    <Label as="a" color="green" onClick={() => this.onUpdate()}>
                        {s("updateStateReady")}
                    </Label>
                );
                break;
            case "error":
                updateLabel = (
                    <Label as="a" color="red" onClick={() => Electron.checkForUpdates()}>
                        {s("updateStateError")}
                    </Label>
                );
                break;
            default:
                updateLabel = (
                    <Label as="a" onClick={() => Electron.checkForUpdates()}>
                        {s("updateStateNone")}
                    </Label>
                );
        }

        return (
            <div className="Page">
                <div className="TopBar">
                    <Header as="h1">{s("settingsHeader")}</Header>
                    <div className="RightTopCorner">
                        <LocalVersionBanner />
                        <span style={{ marginRight: 10 }}>
                            <Button icon onClick={this.toggleTheme}>
                                {store.settings.darkTheme ? <Icon name="sun" /> : <Icon name="moon" />}
                            </Button>
                        </span>
                        <Button onClick={this.openCreds}>{s("editTfsSettingsBtn")}</Button>
                        <Button positive onClick={this.onSave}>
                            {s("settingsBackButton")}
                        </Button>
                    </div>
                </div>
                <Container fluid>
                    <Header as="h3" dividing>
                        {s("settingsQueriesHeader")}
                    </Header>
                    <QueriesSettingsTable />
                    <Header as="h3" dividing>
                        {s("settingsWIHeader")}
                    </Header>
                    <Form.Select
                        label={s("ddRefreshLabel")}
                        options={this.refreshRates}
                        value={store.settings.refreshRate}
                        onChange={(e, { value }) => this.onRateSelect(value as number)}
                    />
                    <br />
                    <Form.Select
                        label={s("sortPattern")}
                        options={this.sortPatterns}
                        value={store.settings.sortPattern}
                        onChange={(e, { value }) => this.onSortSelect(value as TSortPattern)}
                    />
                    <br />
                    <Form.Select
                        label={s("ddShowNotifLabel")}
                        options={this.notificationsModes}
                        value={store.settings.notificationsMode}
                        onChange={(e, { value }) => this.onNotifModeSelect(value as TNotificationsMode)}
                    />
                    <br />
                    <Form.Checkbox
                        label={s("cbIconLabel")}
                        checked={store.settings.iconChangesOnMyWorkItemsOnly}
                        onChange={this.toggleIconColor}
                    />
                    <br />
                    <Form.Checkbox label={s("mineOnTop")} checked={store.settings.mineOnTop} onChange={this.toggleMineOnTop} />
                    <br />

                    <Header as="h3" dividing>
                        {s("settingsOthersHeader")}
                    </Header>
                    <Form.Select
                        label={s("ddLocalesLabel")}
                        options={this.locales}
                        value={store.locale}
                        onChange={(e, { value }) => this.onLocaleSelect(value as TLocale)}
                    />
                    <br />
                    <Form.Checkbox label={s("cbAutostartLabel")} checked={store.autostart} onChange={this.toggleAutostart} />
                    <br />
                    <Form.Checkbox label={s("cbTelemetry")} checked={store.settings.allowTelemetry} onChange={this.toggleTelemetry} />
                    <br />
                    <Header as="h3" dividing>
                        {s("settingsCreditsHeader")}
                    </Header>
                    <Label as="a" image onClick={() => Electron.openUrl("https://github.com/Emestie/flowerpot")}>
                        <img src={avatar} alt="" />
                        <Icon name="github" />
                        Emestie/flowerpot
                    </Label>
                    <Label>
                        {s("versionWord")}
                        <Label.Detail>{Electron.getVer()}</Label.Detail>
                    </Label>
                    <Label as="a" onClick={() => Electron.openUrl("https://github.com/Emestie/flowerpot/releases")}>
                        {s("releaseNotes")}
                    </Label>
                    {updateLabel}
                </Container>
            </div>
        );
    }
}
