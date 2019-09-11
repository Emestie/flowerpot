import { TLists } from "./Settings";
import store from "../store";

export default class Lists {
    public static push(list: TLists, id: number) {
        //remove from other lists if item in them
        this.deleteFromList("deferred", id);
        this.deleteFromList("permawatch", id);
        this.deleteFromList("favorites", id);
        this.deleteFromList("hidden", id);

        store.settings.lists[list].push(id);
    }

    public static deleteFromList(list: TLists, id: number) {
        let l = store.getList(list);
        l = l.filter(x => x !== id);
        store.settings.lists[list] = l;
    }

    public static isIn(list: TLists, id: number) {
        return store.getList(list).indexOf(id) !== -1;
    }
}
