import { settingsMigrationsDonePush, settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";
import { Account } from "./Account";
import Loaders from "./Loaders";
import { ISettings } from "./Settings";

const V_070 = "v0_7_0h";

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

        if (!settings.tfsToken) return this.setMigrationAsDone(V_070);

        const userdata = await Loaders.getUserData(settings.tfsPath, settings.tfsToken).catch(() => ({
            displayName: Account.generateDisplayNameByToken(settings.tfsToken),
            descriptor: "",
        }));

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
        const notes =
            store.getState().settings.notes?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const deferred =
            store.getState().settings.lists.deferred?.map((x) => ({ ...x, accountId: x.accountId || account.id })) ||
            [];
        const favorites =
            store.getState().settings.lists.favorites?.map((x) => ({ ...x, accountId: x.accountId || account.id })) ||
            [];
        const forwarded =
            store.getState().settings.lists.forwarded?.map((x) => ({ ...x, accountId: x.accountId || account.id })) ||
            [];
        const hidden =
            store.getState().settings.lists.hidden?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const keywords =
            store.getState().settings.lists.keywords?.map((x) => ({ ...x, accountId: x.accountId || "" })) || [];
        const permawatch =
            store.getState().settings.lists.permawatch?.map((x) => ({ ...x, accountId: x.accountId || account.id })) ||
            [];
        const pinned =
            store.getState().settings.lists.pinned?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];

        store.dispatch(
            settingsUpdate({
                queries,
                projects,
                notes,
                lists: { deferred, favorites, forwarded, hidden, keywords, permawatch, pinned },
            })
        );

        this.setMigrationAsDone(V_070);
    }
}
