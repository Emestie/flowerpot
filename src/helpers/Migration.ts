import { Account } from "./Account";
import Loaders from "./Loaders";
import { ISettings } from "./Settings";
import { useSettingsStore } from "../zustand/settings";

const V_070 = "v0_7_0h";
const V_085_THEME = "v0_8_5_themes";

export default class Migration {
    private static setMigrationAsDone(name: string) {
        useSettingsStore.getState().addMigration(name);
    }

    public static async perform() {
        const migrations = useSettingsStore.getState().migrationsDone || [];

        if (!migrations.includes(V_070)) await this.v0_7_0();
        if (!migrations.includes(V_085_THEME)) await this.v0_8_5();
    }

    private static async v0_7_0() {
        console.log("Migration " + V_070);

        const settings = useSettingsStore.getState();

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

        if (!settings.accounts?.length) {
            useSettingsStore.getState().setAccounts([account]);
        }

        const queries = settings.queries.map((x) => ({ ...x, accountId: x.accountId || account.id }));
        const projects = settings.projects.map((x) => ({ ...x, accountId: x.accountId || account.id }));
        const notes = settings.notes?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const deferred =
            settings.lists.deferred?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const favorites =
            settings.lists.favorites?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const forwarded =
            settings.lists.forwarded?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const hidden = settings.lists.hidden?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const keywords = settings.lists.keywords?.map((x) => ({ ...x, accountId: x.accountId || "" })) || [];
        const permawatch =
            settings.lists.permawatch?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];
        const pinned = settings.lists.pinned?.map((x) => ({ ...x, accountId: x.accountId || account.id })) || [];

        useSettingsStore.getState().setSettings({
            queries,
            projects,
            notes,
            lists: { deferred, favorites, forwarded, hidden, keywords, permawatch, pinned },
        });

        this.setMigrationAsDone(V_070);
    }

    private static async v0_8_5() {
        console.log("Migration " + V_085_THEME);

        const settings = useSettingsStore.getState();

        if (settings.theme !== undefined) {
            return this.setMigrationAsDone(V_085_THEME);
        }

        const theme: "light" | "dark" = settings.darkTheme ? "dark" : "light";

        useSettingsStore.getState().setTheme(theme);

        this.setMigrationAsDone(V_085_THEME);
    }
}
