import Platform from "./Platform";
import Telemetry from "./Telemetry";
import { getReleasePlant } from "./VersionPlants";
import { useSettingsStore } from "../zustand/settings";

export default class Version {
    /** " Dev" / " Local" for builds that are not a shipped release. */
    private static get verType() {
        return document.location.href.indexOf("localhost") !== -1 ? " Dev" : Platform.current.isLocal() ? " Local" : "";
    }

    public static get long() {
        const appVer = import.meta.env.VITE_APP_VERSION;
        return `${appVer}${Version.verType} (${Version.buildTime})`;
    }

    /** `1.0.0 Dev` — the version number places can brand with a plant name. */
    public static get number() {
        return `${Version.short}${Version.verType}`;
    }

    public static get buildTime() {
        return import.meta.env.VITE_APP_BUILD_TIME;
    }

    public static get short() {
        const appVer = import.meta.env.VITE_APP_VERSION || "";
        return appVer.split("+")[0];
    }

    /** The plant this release is named after, if the release has one. */
    public static get plant() {
        return getReleasePlant(Version.short);
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
