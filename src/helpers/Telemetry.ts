import CyrillicToTranslit from "cyrillic-to-translit-js";
import { store } from "../redux/store";
import Platform from "./Platform";
import Version from "./Version";

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
            const iid = await Platform.current.getStoreProp("installationID");
            const app = "Flowerpot";

            const encodedString = btoa(JSON.stringify({ app, reason, name, ver, platform, os, iid, extraInfo }));

            //http://localhost:8888/.netlify/functions/handle-app-usage?data=
            await fetch("https://mysweetbot.netlify.app/.netlify/functions/handle-app-usage?data=" + encodedString);
        } catch (e: any) {}
    }

    public static versionUsageInfo() {
        this.basicMessage("Version installed");
    }

    public static accountVerificationSucceed() {
        this.basicMessage("Account verified");
    }

    public static sendFeedback(text: string) {
        const transliterated = cyrillicToTranslit.transform(text);
        this.basicMessage("Feedback", "TRNSL:" + transliterated, true);
    }
}
