import Electron from "./Electron";
import store from "../store";

export default class Telemetry {
    private static async basicMessage(reason: string, extraInfo?: string) {
        if (!store.settings.allowTelemetry) return;

        try {
            const ver = Electron.getVer();
            const name = store.settings.tfsUser;

            const encodedString = btoa(JSON.stringify({ reason, name, ver, extraInfo }));

            await fetch("https://mysweetbot-php.herokuapp.com/flowerpot-usage.php?data=" + encodedString);
        } catch (e) {}
    }

    public static versionUsageInfo() {
        this.basicMessage("Version installed");
    }
}
