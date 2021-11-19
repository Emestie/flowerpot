import { Header, Container, Button, Form, DropdownItemProps, Label, Icon } from "semantic-ui-react";
import { QueriesSettingsTable } from "../components/QueriesSettingsTable";
import Platform from "../helpers/Platform";
import { TSortPattern, TNotificationsMode } from "../helpers/Settings";
import { s } from "../values/Strings";
import { LocalVersionBanner } from "../components/LocalVersionBanner";
import Version from "../helpers/Version";
import { ViewHeading } from "../components/heading/ViewHeading";
import { LinksSettingsTable } from "../components/LinksSettingsTable";
import { appDialogSet, appSet, appViewSet } from "../redux/actions/appActions";
import { useDispatch, useSelector } from "react-redux";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { appSelector } from "../redux/selectors/appSelectors";
import { TLocale } from "../redux/types";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

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

export function SettingsView() {
    const dispatch = useDispatch();

    const { autostart, locale, updateStatus } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);

    const openCreds = () => {
        dispatch(appViewSet("credentials"));
    };

    const onRateSelect = (val: number) => {
        const refreshRate = val;
        dispatch(settingsUpdate({ refreshRate }));
    };

    const onSortSelect = (val: TSortPattern) => {
        const sortPattern = val;
        dispatch(settingsUpdate({ sortPattern }));
    };

    const onNotifModeSelect = (val: TNotificationsMode) => {
        const notificationsMode = val;
        dispatch(settingsUpdate({ notificationsMode }));
    };

    const onLocaleSelect = (val: TLocale) => {
        const locale_ = val;
        dispatch(appSet({ locale: locale_ }));
        Platform.current.changeLocale(locale_);
    };

    const toggleAutostart = () => {
        const autostart_ = !autostart;
        dispatch(appSet({ autostart: autostart_ }));
        Platform.current.toggleAutostart(autostart_);
    };

    const toggleIconColor = () => {
        const iconChangesOnMyWorkItemsOnly = !settings.iconChangesOnMyWorkItemsOnly;
        dispatch(settingsUpdate({ iconChangesOnMyWorkItemsOnly }));
    };

    const toggleMineOnTop = () => {
        const mineOnTop = !settings.mineOnTop;
        dispatch(settingsUpdate({ mineOnTop }));
    };

    const toggleTheme = () => {
        const darkTheme = !settings.darkTheme;
        dispatch(settingsUpdate({ darkTheme }));
    };

    const toggleTelemetry = () => {
        const allowTelemetry = !settings.allowTelemetry;
        dispatch(settingsUpdate({ allowTelemetry }));
    };

    const toggleWhatsNewOnUpdate = () => {
        const showWhatsNewOnUpdate = !settings.showWhatsNewOnUpdate;
        dispatch(settingsUpdate({ showWhatsNewOnUpdate }));
    };

    const toggleShowUnreads = () => {
        const showUnreads = !settings.showUnreads;
        dispatch(settingsUpdate({ showUnreads }));
    };

    const toggleShowAvatars = () => {
        const showAvatars = !settings.showAvatars;
        dispatch(settingsUpdate({ showAvatars }));
    };

    const toggleQuickLinks = () => {
        const showQuickLinks = !settings.showQuickLinks;
        dispatch(settingsUpdate({ showQuickLinks }));
    };

    const onSave = () => {
        dispatch(appViewSet("main"));
    };

    const onUpdate = () => {
        Platform.current.updateApp();
    };

    const openListsView = () => {
        dispatch(appViewSet("lists"));
    };

    const getPlatformIcon = () => {
        const os = Platform.current.os;
        if (os === "win32") return <Icon name="windows" />;
        if (os === "darwin") return <Icon name="apple" />;
        return os;
    };

    if (Platform.current.isDev()) {
        if (refreshRates.length !== 5)
            refreshRates.push({
                key: Math.random(),
                text: s("refreshdebug"),
                value: 10,
            });
    }

    let updateLabel = undefined;

    switch (updateStatus) {
        case "checking":
            updateLabel = <Label>{s("updateStateChecking")}</Label>;
            break;
        case "downloading":
            updateLabel = <Label color="teal">{s("updateStateDownloading")}</Label>;
            break;
        case "ready":
            //TODO: button here and updateInstallInProgress
            updateLabel = (
                <Label as="a" color="green" onClick={() => onUpdate()}>
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
                <Button icon onClick={toggleTheme}>
                    {settings.darkTheme ? <Icon name="sun" /> : <Icon name="moon" />}
                </Button>
                <Button positive onClick={onSave}>
                    {s("settingsBackButton")}
                </Button>
            </ViewHeading>
            <Container fluid>
                <Header as="h3" dividing>
                    {s("accountSettingsHeader")}
                </Header>
                <Button icon labelPosition="left" onClick={openCreds}>
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
                <Button icon labelPosition="left" onClick={openListsView}>
                    <Icon name="tasks" /> {s("manageLists")}
                </Button>
                <br />
                <Header as="h3" dividing>
                    {s("quickLinksSettingsHeader")}
                </Header>
                <LinksSettingsTable />
                <Form.Checkbox
                    label={s("cbQuickLinksLabel")}
                    checked={settings.showQuickLinks}
                    onChange={toggleQuickLinks}
                />
                <br />
                <Header as="h3" dividing>
                    {s("settingsWIHeader")}
                </Header>
                <Form.Select
                    label={s("ddRefreshLabel")}
                    options={refreshRates}
                    value={settings.refreshRate}
                    onChange={(e, { value }) => onRateSelect(value as number)}
                />
                <br />
                <Form.Select
                    label={s("sortPattern")}
                    options={sortPatterns}
                    value={settings.sortPattern}
                    onChange={(e, { value }) => onSortSelect(value as TSortPattern)}
                />
                <br />
                <Form.Select
                    label={s("ddShowNotifLabel")}
                    options={notificationsModes}
                    value={settings.notificationsMode}
                    onChange={(e, { value }) => onNotifModeSelect(value as TNotificationsMode)}
                />
                <br />
                <Form.Checkbox
                    label={s("cbIconLabel")}
                    checked={settings.iconChangesOnMyWorkItemsOnly}
                    onChange={toggleIconColor}
                />
                <br />
                <Form.Checkbox label={s("mineOnTop")} checked={settings.mineOnTop} onChange={toggleMineOnTop} />
                <br />
                <Form.Checkbox label={s("showUnreads")} checked={settings.showUnreads} onChange={toggleShowUnreads} />
                <br />
                <Form.Checkbox label={s("showAvatars")} checked={settings.showAvatars} onChange={toggleShowAvatars} />
                <br />
                <Header as="h3" dividing>
                    {s("settingsOthersHeader")}
                </Header>
                <Form.Select
                    label={s("ddLocalesLabel")}
                    options={locales}
                    value={locale}
                    onChange={(e, { value }) => onLocaleSelect(value as TLocale)}
                />
                <br />
                {Platform.current.os === "win32" && (
                    <>
                        <Form.Checkbox label={s("cbAutostartLabel")} checked={autostart} onChange={toggleAutostart} />
                        <br />
                    </>
                )}
                <Form.Checkbox label={s("cbTelemetry")} checked={settings.allowTelemetry} onChange={toggleTelemetry} />
                <br />
                <Form.Checkbox
                    label={s("cbWhatsNew")}
                    checked={settings.showWhatsNewOnUpdate}
                    onChange={toggleWhatsNewOnUpdate}
                />
                <br />
                <Header as="h3" dividing>
                    {s("settingsActionsHeader")}
                </Header>
                {/* <Label as="a" onClick={() => Platform.current.openUrl("https://emestie.github.io/flowerpot/bot")}>
                    {s("flowerbot")}
                </Label> */}
                <Label
                    as="a"
                    color="yellow"
                    onClick={() => {
                        dispatch(appDialogSet("feedback", true));
                    }}
                >
                    {s("feedbackSettingsButton")}
                </Label>
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
                    <Label.Detail>
                        {getPlatformIcon()} {Version.long}
                    </Label.Detail>
                </Label>
                <Label as="a" onClick={() => Platform.current.openUrl("https://emestie.github.io/flowerpot/changelog")}>
                    {s("releaseNotes")}
                </Label>
                {updateLabel}
                <br />
                <br />
            </Container>
        </div>
    );
}
