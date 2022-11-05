import { useDispatch, useSelector } from "react-redux";
import { Header, Form, Label, Icon, DropdownItemProps } from "semantic-ui-react";
import Platform from "../../../helpers/Platform";
import Version from "../../../helpers/Version";
import { appDialogSet, appSet, appViewSet } from "../../../redux/actions/appActions";
import { settingsUpdate } from "../../../redux/actions/settingsActions";
import { appSelector } from "../../../redux/selectors/appSelectors";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { TLocale } from "../../../redux/types";
import { s } from "../../../values/Strings";
import avatar from "../../../assets/ti.jpg";

const locales: DropdownItemProps[] = [
    { key: 2, text: s("localeEn"), value: "en" },
    { key: 3, text: s("localeRu"), value: "ru" },
];

export function CreditsSection() {
    const dispatch = useDispatch();
    const { autostart, locale, updateStatus } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);

    const showChangelog = () => {
        dispatch(appViewSet("info", { viewCaption: s("releaseNotes"), contentFileName: "changelog.md" }));
    };

    const getPlatformIcon = () => {
        const os = Platform.current.os;
        if (os === "win32") return <Icon name="windows" />;
        if (os === "darwin") return <Icon name="apple" />;
        return os;
    };

    const toggleTelemetry = () => {
        const allowTelemetry = !settings.allowTelemetry;
        dispatch(settingsUpdate({ allowTelemetry }));
    };

    const toggleWhatsNewOnUpdate = () => {
        const showWhatsNewOnUpdate = !settings.showWhatsNewOnUpdate;
        dispatch(settingsUpdate({ showWhatsNewOnUpdate }));
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
            <Form.Checkbox
                label={s("cbWhatsNew")}
                checked={settings.showWhatsNewOnUpdate}
                onChange={toggleWhatsNewOnUpdate}
            />
            <br />
            <Header as="h3" dividing>
                {s("settingsActionsHeader")}
            </Header>
            <Label
                as="a"
                color="yellow"
                onClick={() => {
                    dispatch(appDialogSet("feedback", true));
                }}
            >
                {s("feedbackSettingsButton")}
            </Label>
            <Label as="a" color="purple" onClick={() => Platform.current.openUrl("https://emestie.github.io/rocket")}>
                {s("rocketBanner2")}
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
            <Label as="a" onClick={showChangelog}>
                {s("releaseNotes")}
            </Label>
            {updateLabel}
        </>
    );
}
