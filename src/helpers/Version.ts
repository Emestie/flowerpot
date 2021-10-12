import preval from "preval.macro";
import Platform from "./Platform";
import Telemetry from "./Telemetry";
import store from "../store-mbx";

export default class Version {
    public static get long() {
        const appVer = process.env.REACT_APP_VERSION;
        const dateTimeStamp = preval`module.exports = new Date().toISOString().substr(0, 16);`;
        const verType = document.location.href.indexOf("localhost") !== -1 ? " Dev" : Platform.current.isLocal() ? " Local" : "";
        return `${appVer}${verType} (${dateTimeStamp})`;
    }

    public static get short() {
        const appVer = process.env.REACT_APP_VERSION || "";
        return appVer.split("+")[0];
    }

    public static isChangedLong() {
        return store.settings.lastTimeVersionLong !== Version.long;
    }

    public static isChangedShort() {
        return store.settings.lastTimeVersion !== Version.short;
    }

    public static storeInSettings() {
        store.settings.lastTimeVersion = Version.short;
        store.settings.lastTimeVersionLong = Version.long;
        store.updateSettings();
        Telemetry.versionUsageInfo();
    }
}
