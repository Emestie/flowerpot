import { Button, DropdownItemProps, Form, Header } from "semantic-ui-react";
import Platform, { PlatformType } from "../../../helpers/Platform";
import { TNotificationsMode } from "../../../helpers/Settings";
import { s } from "../../../values/Strings";
import { useSettingsStore } from "../../../zustand/settings";

const getNotificationsModes: () => DropdownItemProps[] = () => [
    { key: 1, text: s("notifModeAll"), value: "all" },
    { key: 2, text: s("notifModeMine"), value: "mine" },
    { key: 3, text: s("notifModeNone"), value: "none" },
];

const getPrNotificationOptions: () => DropdownItemProps[] = () => [
    { key: 1, text: s("on"), value: "on" },
    { key: 2, text: s("off"), value: "off" },
];

export function NotificationsSection() {
    const notificationsMode = useSettingsStore((state) => state.notificationsMode);
    const prNotifications = useSettingsStore((state) => state.prNotifications);
    const setNotificationsMode = useSettingsStore((state) => state.setNotificationsMode);
    const setPrNotifications = useSettingsStore((state) => state.setPrNotifications);

    const notificationsModes = getNotificationsModes();
    const prNotificationOptions = getPrNotificationOptions();

    const onNotifModeSelect = (val: TNotificationsMode) => {
        setNotificationsMode(val);
    };

    const onPrNotifSelect = (val: string) => {
        setPrNotifications(val);
    };

    const requestNotificationPermission = () => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    const isWeb = Platform.type === PlatformType.Web;
    const showPermissionButton =
        isWeb && "Notification" in window && Notification.permission !== "granted";

    return (
        <>
            <Header as="h3" dividing>
                {s("settingsNotificationsHeader")}
            </Header>
            <Form.Select
                label={s("ddShowNotifLabel")}
                options={notificationsModes}
                value={notificationsMode}
                onChange={(e, { value }) => onNotifModeSelect(value as TNotificationsMode)}
            />
            <br />
            <Form.Select
                label={s("prNotifications")}
                options={prNotificationOptions}
                value={prNotifications}
                onChange={(e, { value }) => onPrNotifSelect(value as string)}
            />
            <br />
            {showPermissionButton && (
                <>
                    <Button onClick={requestNotificationPermission}>
                        {s("requestNotificationPermission")}
                    </Button>
                    <br />
                </>
            )}
        </>
    );
}
