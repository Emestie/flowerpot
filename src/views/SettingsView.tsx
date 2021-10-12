import React, { useState } from "react";
import { Header, Container, Button, Form, DropdownItemProps, Label, Icon } from "semantic-ui-react";
import QueriesSettingsTable from "../components/QueriesSettingsTable";
import Platform from "../helpers/Platform";
import { TSortPattern, TNotificationsMode } from "../helpers/Settings";
import { s } from "../values/Strings";
import LocalVersionBanner from "../components/LocalVersionBanner";
import Version from "../helpers/Version";
import ViewHeading from "../components/heading/ViewHeading";
import LinksSettingsTable from "../components/LinksSettingsTable";
import { appSettingsSet, appViewSet } from "../redux/actions/appActions";
import { useDispatch, useSelector } from "react-redux";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { appSelector } from "../redux/selectors/appSelectors";
import { TLocale } from "../redux/types";

const avatar = require("../assets/ti.jpg").default as string;

const refreshRates: DropdownItemProps[] = [
    { key: 1, text: s("refresh1m"), value: 60 },
    { key: 2, text: s("refresh3m"), value: 180 },
    { key: 3, text: s("refresh5m"), value: 300 },
    { key: 4, text: s("refresh10m"), value: 600 },
];

const sortPatterns: DropdownItemProps[] = [
    { key: 1, text: s("sortPatternWeight"), value: "default" },
    { key: 2, text: s("sortPatternAssigned"), value: "assignedto" },
    { key: 3, text: s("sortPatternId"), value: "id" },
];

const notificationsModes: DropdownItemProps[] = [
    { key: 1, text: s("notifModeAll"), value: "all" },
    { key: 2, text: s("notifModeMine"), value: "mine" },
    { key: 3, text: s("notifModeNone"), value: "none" },
];

const locales: DropdownItemProps[] = [
    { key: 2, text: s("localeEn"), value: "en" },
    { key: 3, text: s("localeRu"), value: "ru" },
];

export function SettingsView(){
    const dispatch = useDispatch();
    const[updateInstallInProgress, setUpdateInstallInProgress] = useState(false);

    const {autostart, locale} = useSelector(appSelector)

    const openCreds = () => {
        dispatch(appViewSet('credentials'))
    };

    const onRateSelect= (val: number) => {
        const refreshRate = val;
        dispatch(settingsUpdate({refreshRate}))
    }

    const onSortSelect=(val: TSortPattern) =>{
        const sortPattern = val;
        dispatch(settingsUpdate({sortPattern}))
    }

    const onNotifModeSelect=(val: TNotificationsMode) =>{
        const notificationsMode = val;
        dispatch(settingsUpdate({notificationsMode}))
    }

    const onLocaleSelect= (val: TLocale) =>{
        const locale_ = val;
        dispatch(appSettingsSet({locale: locale_}))
    }

    const toggleAutostart = () => {
        const autostart_ = !autostart;
        dispatch(appSettingsSet({autostart: autostart_}))
    };

    const toggleIconColor = () => {
        store.settings.iconChangesOnMyWorkItemsOnly = !store.settings.iconChangesOnMyWorkItemsOnly;
        store.updateSettings();
    };

    const toggleMineOnTop = () => {
        store.settings.mineOnTop = !store.settings.mineOnTop;
        store.updateSettings();
    };

    const toggleTheme = () => {
        store.settings.darkTheme = !store.settings.darkTheme;
        store.updateSettings();
    };

    const toggleTelemetry = () => {
        store.settings.allowTelemetry = !store.settings.allowTelemetry;
        store.updateSettings();
    };

    const toggleWhatsNewOnUpdate = () => {
        store.settings.showWhatsNewOnUpdate = !store.settings.showWhatsNewOnUpdate;
        store.updateSettings();
    };

    const toggleShowUnreads = () => {
        store.settings.showUnreads = !store.settings.showUnreads;
        store.updateSettings();
    };

    const toggleShowAvatars = () => {
        store.settings.showAvatars = !store.settings.showAvatars;
        store.updateSettings();
    };

    const toggleQuickLinks = () => {
        store.settings.showQuickLinks = !store.settings.showQuickLinks;
        store.updateSettings();
    };

    const onSave = () => {
        store.switchView("main");
    };

    const onUpdate = () => {
        this.setState({ updateInstallInProgress: true });
        Platform.current.updateApp();
    };

    const openListsView = () => {
        store.switchView("lists");
    };

    render() {
        if (Platform.current.isDev()) {
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
                    <Label as="a" color="red" onClick={() => Platform.current.checkForUpdates()}>
                        {s("updateStateError")}
                    </Label>
                );
                break;
            default:
                updateLabel = (
                    <Label as="a" onClick={() => Platform.current.checkForUpdates()}>
                        {s("updateStateNone")}
                    </Label>
                );
        }

        return (
            <div className="Page">
                <ViewHeading>
                    <LocalVersionBanner />
                    <span style={{ marginRight: 10 }}>
                        <Button icon onClick={this.toggleTheme}>
                            {store.settings.darkTheme ? <Icon name="sun" /> : <Icon name="moon" />}
                        </Button>
                    </span>
                    <Button positive onClick={this.onSave}>
                        {s("settingsBackButton")}
                    </Button>
                </ViewHeading>
                <Container fluid>
                    <Header as="h3" dividing>
                        {s("accountSettingsHeader")}
                    </Header>
                    <Button icon labelPosition="left" onClick={this.openCreds}>
                        <Icon name="plug" />
                        {s("editTfsSettingsBtn")}
                    </Button>
                    <br />
                    <Header as="h3" dividing>
                        {s("settingsQueriesHeader")}
                    </Header>
                    <QueriesSettingsTable />
                    <Header as="h3" dividing>
                        {s("customListsSettingsHeader")}
                    </Header>
                    <Button icon labelPosition="left" onClick={this.openListsView}>
                        <Icon name="tasks" /> {s("manageLists")}
                    </Button>
                    <br />
                    <Header as="h3" dividing>
                        {s("quickLinksSettingsHeader")}
                    </Header>
                    <LinksSettingsTable />
                    <Form.Checkbox
                        label={s("cbQuickLinksLabel")}
                        checked={store.settings.showQuickLinks}
                        onChange={this.toggleQuickLinks}
                    />
                    <br />
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
                    <Form.Checkbox label={s("showUnreads")} checked={store.settings.showUnreads} onChange={this.toggleShowUnreads} />
                    <br />
                    <Form.Checkbox label={s("showAvatars")} checked={store.settings.showAvatars} onChange={this.toggleShowAvatars} />
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
                    <Form.Checkbox
                        label={s("cbWhatsNew")}
                        checked={store.settings.showWhatsNewOnUpdate}
                        onChange={this.toggleWhatsNewOnUpdate}
                    />
                    <br />
                    <Header as="h3" dividing>
                        {s("settingsCreditsHeader")}
                    </Header>
                    <Label as="a" image onClick={() => Platform.current.openUrl("https://github.com/Emestie/flowerpot")}>
                        <img src={avatar} alt="" />
                        <Icon name="github" />
                        Emestie/flowerpot
                    </Label>
                    <Label>
                        {s("versionWord")}
                        <Label.Detail>{Version.long}</Label.Detail>
                    </Label>
                    <Label as="a" onClick={() => Platform.current.openUrl("https://emestie.github.io/flowerpot/changelog")}>
                        {s("releaseNotes")}
                    </Label>
                    <Label as="a" onClick={() => Platform.current.openUrl("https://emestie.github.io/flowerpot/bot")}>
                        {s("flowerbot")}
                    </Label>
                    <Label
                        as="a"
                        color="yellow"
                        onClick={() => {
                            store.dialogs.feedback = true;
                        }}
                    >
                        {s("feedbackSettingsButton")}
                    </Label>
                    {updateLabel}
                    <br />
                    <br />
                    {/* {s("contributors")}
                    <Label size="tiny" as="a" onClick={() => Platform.current.openUrl("https://github.com/Stassras")}>
                        <Icon name="github" />
                        Stassras
                    </Label>
                    <Label size="tiny" as="a" onClick={() => Platform.current.openUrl("https://github.com/selikhovamary")}>
                        <Icon name="github" />
                        selikhovamary
                    </Label> */}
                </Container>
            </div>
        );
    }
}
