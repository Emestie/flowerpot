import { TLists } from "./Settings";
import store from "../store";

export default class Lists {
    public static push(list: TLists, id: number, rev?: number) {
        if (!rev) rev = 0;

        //remove from other lists if item in them
        this.deleteFromList("deferred", id);
        this.deleteFromList("permawatch", id);
        this.deleteFromList("favorites", id);
        this.deleteFromList("hidden", id);

        store.settings.lists[list].push({ id: id, rev: rev });
    }

    public static deleteFromList(list: TLists, id: number) {
        let l = store.getList(list);
        l = l.filter(x => x.id !== id);
        store.settings.lists[list] = l;
    }

    public static isIn(list: TLists, id: number, rev?: number) {
        return !!store.getList(list).find(x => x.id === id && (rev ? x.rev === rev : true));
    }
}
