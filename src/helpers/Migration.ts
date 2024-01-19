import { settingsMigrationsDonePush, settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";
import Platform from "./Platform";

export default class Migration {
    private static setMigrationAsDone(name: string) {
        store.dispatch(settingsMigrationsDonePush(name));
    }

    public static async perform() {
        const migrations = store.getState().settings.migrationsDone || [];

        if (!migrations.includes("v0_4_5_to_v0_5_0")) await this.v0_4_5_to_v0_5_0();
        if (!migrations.includes("v0_6_0_token")) await this.v0_6_0_token();
    }

    private static async v0_4_5_to_v0_5_0() {
        console.log("Migration v0_4_5_to_v0_5_0");

        const iid = await Platform.current.getStoreProp<string>("installationID");
        if (iid && !iid.startsWith("FLW-")) {
            Platform.current.setStoreProp("installationID", "FLW-" + iid);
        }

        this.setMigrationAsDone("v0_4_5_to_v0_5_0");
    }

    private static async v0_6_0_token() {
        console.log("Migration v0_6_0_token");

        const settings = store.getState().settings;

        if (!settings.tfsToken && settings.tfsUser && settings.tfsPwd && settings.tfsPath) {
            const tfsToken = await Platform.current.extractNpmrcPat();
            const credentialsChecked = !!tfsToken;

            store.dispatch(settingsUpdate({ tfsUser: "", tfsPwd: "", tfsToken: tfsToken || "", credentialsChecked }));
        }

        this.setMigrationAsDone("v0_6_0_token");
    }
}
