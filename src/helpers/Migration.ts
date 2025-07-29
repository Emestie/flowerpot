import { settingsMigrationsDonePush, settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";
import { Account } from "./Account";
import Loaders from "./Loaders";
import { ISettings } from "./Settings";

const V_070 = "v0_7_0d";

export default class Migration {
    private static setMigrationAsDone(name: string) {
        store.dispatch(settingsMigrationsDonePush(name));
    }

    public static async perform() {
        const migrations = store.getState().settings.migrationsDone || [];

        if (!migrations.includes(V_070)) await this.v0_7_0();
    }

    private static async v0_7_0() {
        console.log("Migration " + V_070);

        const settings = store.getState().settings;

        const userdata = await Loaders.getUserData(settings.tfsPath, settings.tfsToken);

        const account: ISettings["accounts"][number] = {
            url: settings.tfsPath,
            token: settings.tfsToken,
            id: "migrated",
            displayName:
                userdata.displayName ??
                (settings.tfsToken ? Account.generateDisplayNameByToken(settings.tfsToken) : "unknown"),
            descriptor: userdata.descriptor,
            badge: 1,
        };

        if (!store.getState().settings.accounts?.length) {
            store.dispatch(settingsUpdate({ accounts: [account] }));
        }

        const queries = store.getState().settings.queries.map((x) => ({ ...x, accountId: x.accountId || account.id }));
        const projects = store
            .getState()
            .settings.projects.map((x) => ({ ...x, accountId: x.accountId || account.id }));

        store.dispatch(settingsUpdate({ queries, projects }));

        this.setMigrationAsDone(V_070);
    }
}
