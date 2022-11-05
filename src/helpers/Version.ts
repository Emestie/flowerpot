import { settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";
import Platform from "./Platform";
import Telemetry from "./Telemetry";

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
        const { lastTimeVersionLong } = store.getState().settings;
        return lastTimeVersionLong !== Version.long;
    }

    public static isChangedShort() {
        const { lastTimeVersion } = store.getState().settings;
        return lastTimeVersion !== Version.short;
    }

    public static storeInSettings() {
        const lastTimeVersion = Version.short;
        const lastTimeVersionLong = Version.long;

        store.dispatch(settingsUpdate({ lastTimeVersion, lastTimeVersionLong }));

        Telemetry.versionUsageInfo();
    }
}
