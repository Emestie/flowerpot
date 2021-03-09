import store from "../store";

export default class Migration {
    private static setMigrationAsDone(name: string, dontSaveSettings?: boolean) {
        store.settings.migrationsDone.push(name);
        if (!dontSaveSettings) store.updateSettings();
    }

    public static perform() {
        const migrations = store.settings.migrationsDone || [];

        if (!migrations.includes("v0_2_12_to_v0_2_13")) this.v0_2_12_to_v0_2_13();
        if (!migrations.includes("v0_2_13_notes")) this.v0_2_13_notes();
      //  if (!migrations.includes("v0_2_14_to_v0_2_15_flowerbotBanner")) this.v0_2_14_to_v0_2_15_flowerbotBanner();
    }

    private static v0_2_12_to_v0_2_13() {
        //check if tfs path contains collection
        const path = store.settings.tfsPath;
        if (path.indexOf("Collection") === -1) return this.setMigrationAsDone("v0_2_12_to_v0_2_13");

        console.log("Migration v0_2_12_to_v0_2_13");

        const pieces = path.split("/");

        const collectionName = pieces[pieces.length - 2];

        store.settings.tfsPath = pieces.filter((x) => x.indexOf("Collection") === -1).join("/");

        //set former collection to all queries if there is no any
        store.settings.queries = (store.settings.queries || []).map((x) => ({ ...x, collectionName: collectionName }));

        store.settings.lists.permawatch = (store.settings.lists.permawatch || []).map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.deferred = (store.settings.lists.deferred || []).map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.favorites = (store.settings.lists.favorites || []).map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.hidden = (store.settings.lists.hidden || []).map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.pinned = (store.settings.lists.pinned || []).map((x) => ({ ...x, collection: x.collection || collectionName }));

        //store.updateSettings();
        this.setMigrationAsDone("v0_2_12_to_v0_2_13");
    }

    private static v0_2_13_notes() {
        console.log("Migration v0_2_13_notes");

        store.settings.notes = (store.settings.notes || []).map((x) => {
            if (!x.collection) x.collection = "DefaultCollection";
            return x;
        });

        this.setMigrationAsDone("v0_2_13_notes");
        //store.updateSettings();
    }

    // private static v0_2_14_to_v0_2_15_flowerbotBanner() {
    //     store.showFlowerbotBanner = true;
    //     this.setMigrationAsDone("v0_2_14_to_v0_2_15_flowerbotBanner");
    // }
}
