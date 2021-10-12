import store from "../store-mbx";
import Platform from "./Platform";
import Version from "./Version";
import CyrillicToTranslit from "cyrillic-to-translit-js";

const cyrillicToTranslit = new CyrillicToTranslit();

export default class Telemetry {
    private static async basicMessage(reason: string, extraInfo?: string, ignoreTelemetryDisability?: boolean) {
        if (!store.settings.allowTelemetry && !ignoreTelemetryDisability) return;

        try {
            const ver = Version.long;
            const name = store.settings.tfsUser;
            if (!name) return;

            const encodedString = btoa(JSON.stringify({ reason, name, ver, extraInfo }));

            await fetch("https://mysweetbot-php.herokuapp.com/flowerpot-usage.php?data=" + encodedString);
        } catch (e: any) {}
    }

    public static versionUsageInfo() {
        const theme = store.settings.darkTheme ? "dark" : "light";
        const lang = store.locale;
        const platform = Platform.type;
        this.basicMessage("Version installed", `platform=${platform}, theme=${theme}, lang=${lang}`);
    }

    public static accountVerificationSucceed() {
        this.basicMessage("Account verified");
    }

    public static sendFeedback(text: string) {
        const transliterated = cyrillicToTranslit.transform(text);
        this.basicMessage("Feedback", transliterated, true);
    }
}
