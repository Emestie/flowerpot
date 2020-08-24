import store from "../store";

export default class Migration {
    public static perform() {
        this.v0_2_12_to_v0_2_13();
    }

    private static v0_2_12_to_v0_2_13() {
        //check if tfs path contains collection
        const path = store.settings.tfsPath;
        if (path.indexOf("Collection") === -1) return;
        
        console.log('Migration v0_2_12_to_v0_2_13');
        
        const pieces = path.split("/");

        const collectionName = pieces[pieces.length - 2];

        store.settings.tfsPath = pieces.filter((x) => x.indexOf("Collection") === -1).join("/");

        //set former collection to all queries if there is no any
        store.settings.queries = store.settings.queries.map((x) => ({ ...x, collectionName: collectionName }));

        store.settings.lists.permawatch = store.settings.lists.permawatch.map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.deferred = store.settings.lists.deferred.map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.favorites = store.settings.lists.favorites.map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.hidden = store.settings.lists.hidden.map((x) => ({ ...x, collection: x.collection || collectionName }));
        store.settings.lists.pinned = store.settings.lists.pinned.map((x) => ({ ...x, collection: x.collection || collectionName }));

        store.updateSettings();
    }
}
