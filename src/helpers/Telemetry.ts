import Platform from "./Platform";
import Version from "./Version";
import CyrillicToTranslit from "cyrillic-to-translit-js";
import { store } from "../redux/store";

const cyrillicToTranslit = new CyrillicToTranslit();

export default class Telemetry {
    private static async basicMessage(reason: string, extraInfo?: string, ignoreTelemetryDisability?: boolean) {
        const { allowTelemetry, tfsUser } = store.getState().settings;
        if (!allowTelemetry && !ignoreTelemetryDisability) return;

        try {
            const name = tfsUser;
            if (!name) return;
            const ver = Version.long;
            const platform = Platform.type;
            const os = Platform.current.os;

            const encodedString = btoa(JSON.stringify({ reason, name, ver, platform, os, extraInfo }));

            await fetch("https://mysweetbot-php.herokuapp.com/flowerpot-usage.php?data=" + encodedString);
        } catch (e: any) {}
    }

    public static versionUsageInfo() {
        const { locale } = store.getState().app;
        const { darkTheme } = store.getState().settings;
        const theme = darkTheme ? "dark" : "light";

        this.basicMessage("Version installed", `theme=${theme}, locale=${locale}`);
    }

    public static accountVerificationSucceed() {
        this.basicMessage("Account verified");
    }

    public static sendFeedback(text: string) {
        const transliterated = cyrillicToTranslit.transform(text);
        this.basicMessage("Feedback", "TRNSL:" + transliterated, true);
    }
}
