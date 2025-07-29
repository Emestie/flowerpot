import CyrillicToTranslit from "cyrillic-to-translit-js";
import { store } from "../redux/store";
import { preloadConnectionData } from "./Connection";
import Platform from "./Platform";
import Version from "./Version";

const cyrillicToTranslit = new CyrillicToTranslit();

export default class Telemetry {
    private static async basicMessage(
        accountId: string | null,
        reason: string,
        extraInfo?: string,
        ignoreTelemetryDisability?: boolean
    ) {
        const { allowTelemetry, accounts } = store.getState().settings;
        if (!allowTelemetry && !ignoreTelemetryDisability) return;

        const account0 = accounts.at(0);
        const _accountId = accountId ?? account0?.id;
        const userName = accounts.find((a) => a.id === _accountId)?.displayName ?? "Unknown";

        const accountName = _accountId
            ? (await preloadConnectionData(_accountId))?.authenticatedUser?.properties?.Account?.$value
            : undefined;

        try {
            const name = [cyrillicToTranslit.transform(userName), accountName].join(" / ");
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
        this.basicMessage(null, "Version installed");
    }

    public static accountVerificationSucceed(accountId: string) {
        this.basicMessage(accountId, "Account verified");
    }

    public static sendFeedback(text: string) {
        const transliterated = cyrillicToTranslit.transform(text);
        this.basicMessage(null, "Feedback", "TRNSL:" + transliterated, true);
    }
}
