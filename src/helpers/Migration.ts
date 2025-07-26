import { settingsMigrationsDonePush, settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";
import { Account } from "./Account";
import { ISettings } from "./Settings";

export default class Migration {
    private static setMigrationAsDone(name: string) {
        store.dispatch(settingsMigrationsDonePush(name));
    }

    public static async perform() {
        const migrations = store.getState().settings.migrationsDone || [];

        if (!migrations.includes("v0_7_0")) this.v0_7_0();
    }

    private static v0_7_0() {
        console.log("Migration v0_7_0");

        const settings = store.getState().settings;

        const account: ISettings["accounts"][number] = {
            url: settings.tfsPath,
            token: settings.tfsToken,
            id: "migrated",
            displayName: settings.tfsToken ? Account.generateDisplayNameByToken(settings.tfsToken) : "unknown",
            badge: 1,
        };

        if (!store.getState().settings.accounts?.length) store.dispatch(settingsUpdate({ accounts: [account] }));

        this.setMigrationAsDone("v0_7_0");
    }
}
