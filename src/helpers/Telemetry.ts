import Electron from "./Electron";
import store from "../store";

export default class Telemetry {
    private static async basicMessage(reason: string, extraInfo?: string) {
        if (!store.settings.allowTelemetry) return;

        try {
            const ver = Electron.getVerLong();
            const name = store.settings.tfsUser;

            const encodedString = btoa(JSON.stringify({ reason, name, ver, extraInfo }));

            await fetch("https://mysweetbot-php.herokuapp.com/flowerpot-usage.php?data=" + encodedString);
        } catch (e) {}
    }

    public static versionUsageInfo() {
        const theme = store.settings.darkTheme ? "dark" : "light";
        const notes = store.settings.showWhatsNewOnUpdate ? 1 : 0;
        this.basicMessage("Version installed", `theme=${theme}, shownotes=${notes}`);
    }
}
