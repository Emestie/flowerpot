import { settingsMigrationsDonePush } from "../redux/actions/settingsActions";
import { store } from "../redux/store";
import Platform from "./Platform";

export default class Migration {
    private static setMigrationAsDone(name: string) {
        store.dispatch(settingsMigrationsDonePush(name));
    }

    public static async perform() {
        const migrations = store.getState().settings.migrationsDone || [];

        if (!migrations.includes("v0_4_5_to_v0_5_0")) await this.v0_4_5_to_v0_5_0();
    }

    private static async v0_4_5_to_v0_5_0() {
        console.log("Migration v0_4_5_to_v0_5_0");

        const iid = await Platform.current.getStoreProp<string>("installationID");
        if (iid && !iid.startsWith("FLW-")) {
            Platform.current.setStoreProp("installationID", "FLW-" + iid);
        }

        this.setMigrationAsDone("v0_4_5_to_v0_5_0");
    }
}
