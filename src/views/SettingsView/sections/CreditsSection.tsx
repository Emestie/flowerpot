import { useSelector } from "react-redux";
import { DropdownItemProps, Form, Header, Icon, Label } from "semantic-ui-react";
import avatar from "../../../assets/ti.jpg";
import Platform, { PlatformType } from "../../../helpers/Platform";
import Version from "../../../helpers/Version";
import { settingsUpdate } from "../../../redux/actions/settingsActions";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { TLocale } from "../../../redux/types";
import { s } from "../../../values/Strings";
import { useAppStore } from "../../../zustand/app";

const locales: DropdownItemProps[] = [
    { key: 2, text: s("localeEn"), value: "en" },
    { key: 3, text: s("localeRu"), value: "ru" },
];

export function CreditsSection() {
    const autostart = useAppStore((state) => state.autostart);
    const locale = useAppStore((state) => state.locale);
    const updateStatus = useAppStore((state) => state.updateStatus);
    const setView = useAppStore((state) => state.setView);
    const setSettings = useAppStore((state) => state.setSettings);
    const setDialog = useAppStore((state) => state.setDialog);
    const settings = useSelector(settingsSelector);

    const showChangelog = () => {
        setView("info", { viewCaption: s("releaseNotes"), contentFileName: "changelog.md" });
    };

    const getPlatformIcon = () => {
        const os = Platform.current.os;
        if (os === "win32") return <Icon name="windows" />;
        if (os === "darwin" || os === "ios") return <Icon name="apple" />;
        if (os === "web") return <Icon name="globe" />;
        if (os === "linux") return <Icon name="linux" />;
        if (os === "android") return <Icon name="android" />;
        return os;
    };

    const toggleTelemetry = () => {
        const allowTelemetry = !settings.allowTelemetry;
        settingsUpdate({ allowTelemetry });
    };

    const onLocaleSelect = (val: TLocale) => {
        setSettings({ locale: val });
        Platform.current.changeLocale(val);
    };

    const toggleAutostart = () => {
        const autostart_ = !autostart;
        setSettings({ autostart: autostart_ });
        Platform.current.toggleAutostart(autostart_);
    };

    const onUpdate = () => {
        Platform.current.updateApp();
    };

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
        <>
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
            <Header as="h3" dividing>
                {s("settingsActionsHeader")}
            </Header>
            {settings.accounts.length > 0 && (
                <Label
                    as="a"
                    color="green"
                    onClick={() => {
                        setDialog("feedback", true);
                    }}
                >
                    {s("feedbackSettingsButton")}
                </Label>
            )}
            {Platform.type === PlatformType.Electron && (
                <Label
                    as="a"
                    color="orange"
                    onClick={() => {
                        Platform.current.openUrl("https://flowerpot-pwa.web.app");
                    }}
                >
                    {s("openWebVersion")}
                </Label>
            )}
            <br />
            <Header as="h3" dividing>
                {s("settingsCreditsHeader")}
            </Header>
            <Label
                as="a"
                image
                onClick={() => Platform.current.openUrl("https://github.com/Emestie/flowerpot")}
                style={{ marginBottom: 8 }}
            >
                <img src={avatar} alt="" />
                <Icon name="github" />
                Emestie/flowerpot
            </Label>
            <Label style={{ marginBottom: 8 }}>
                {s("versionWord")}
                <Label.Detail>
                    {getPlatformIcon()} {Version.long}
                </Label.Detail>
            </Label>
            <Label as="a" onClick={showChangelog} style={{ marginBottom: 8 }}>
                {s("releaseNotes")}
            </Label>
            {Platform.type === PlatformType.Web ? null : updateLabel}
        </>
    );
}
