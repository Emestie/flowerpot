import { settingsMigrationsDonePush, settingsUpdate } from "../redux/actions/settingsActions";
import { store } from "../redux/store";
import Platform from "./Platform";

export default class Migration {
    private static setMigrationAsDone(name: string) {
        store.dispatch(settingsMigrationsDonePush(name));
    }

    public static perform() {
        const migrations = store.getState().settings.migrationsDone || [];

        if (!migrations.includes("v0_2_12_to_v0_2_13")) this.v0_2_12_to_v0_2_13();
        if (!migrations.includes("v0_2_13_notes")) this.v0_2_13_notes();
        if (!migrations.includes("v0_4_5_to_v0_5_0")) this.v0_4_5_to_v0_5_0();
    }

    private static v0_2_12_to_v0_2_13() {
        //check if tfs path contains collection
        const settings = store.getState().settings;

        const path = settings.tfsPath;
        if (path.indexOf("Collection") === -1) return this.setMigrationAsDone("v0_2_12_to_v0_2_13");

        console.log("Migration v0_2_12_to_v0_2_13");

        const pieces = path.split("/");

        const collectionName = pieces[pieces.length - 2];

        const tfsPath = pieces.filter((x) => x.indexOf("Collection") === -1).join("/");

        //set former collection to all queries if there is no any
        const queries = (settings.queries || []).map((x) => ({ ...x, collectionName: collectionName }));

        const lists = settings.lists;

        lists.permawatch = (settings.lists.permawatch || []).map((x) => ({
            ...x,
            collection: x.collection || collectionName,
        }));
        lists.deferred = (settings.lists.deferred || []).map((x) => ({
            ...x,
            collection: x.collection || collectionName,
        }));
        lists.favorites = (settings.lists.favorites || []).map((x) => ({
            ...x,
            collection: x.collection || collectionName,
        }));
        lists.hidden = (settings.lists.hidden || []).map((x) => ({
            ...x,
            collection: x.collection || collectionName,
        }));
        lists.pinned = (settings.lists.pinned || []).map((x) => ({
            ...x,
            collection: x.collection || collectionName,
        }));

        store.dispatch(settingsUpdate({ tfsPath, queries, lists }));
        this.setMigrationAsDone("v0_2_12_to_v0_2_13");
    }

    private static v0_2_13_notes() {
        console.log("Migration v0_2_13_notes");

        const settings = store.getState().settings;

        const notes = (settings.notes || []).map((x) => {
            if (!x.collection) x.collection = "DefaultCollection";
            return x;
        });

        store.dispatch(settingsUpdate({ notes }));

        this.setMigrationAsDone("v0_2_13_notes");
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
