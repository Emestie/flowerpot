import Platform from "./Platform";
import Telemetry from "./Telemetry";
import { useSettingsStore } from "../zustand/settings";

export default class Version {
    public static get long() {
        const appVer = import.meta.env.VITE_APP_VERSION;
        const dateTimeStamp = import.meta.env.VITE_APP_BUILD_TIME;
        const verType =
            document.location.href.indexOf("localhost") !== -1 ? " Dev" : Platform.current.isLocal() ? " Local" : "";
        return `${appVer}${verType} (${dateTimeStamp})`;
    }

    public static get short() {
        const appVer = import.meta.env.VITE_APP_VERSION || "";
        return appVer.split("+")[0];
    }

    public static isChangedLong() {
        const { lastTimeVersionLong } = useSettingsStore.getState();
        return lastTimeVersionLong !== Version.long;
    }

    public static isChangedShort() {
        const { lastTimeVersion } = useSettingsStore.getState();
        return lastTimeVersion !== Version.short;
    }

    public static storeInSettings() {
        const lastTimeVersion = Version.short;
        const lastTimeVersionLong = Version.long;

        useSettingsStore.getState().setLastVersion(lastTimeVersion);
        useSettingsStore.getState().setLastVersionLong(lastTimeVersionLong);

        setTimeout(() => {
            if (useSettingsStore.getState().accounts.length > 0) Telemetry.versionUsageInfo();
        }, 5000);
    }
}
