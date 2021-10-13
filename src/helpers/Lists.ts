import { settingsListUpdate, settingsUpdate } from "../redux/actions/settingsActions";
import { getListsSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";
import { TLists } from "./Settings";

export default class Lists {
    public static push(listName: TLists, collection: string, id: number, rev?: number) {
        if (!rev) rev = 0;

        //remove from other lists if item in them
        const deferred = this.deleteFromList("deferred", id, collection, true);
        const permawatch = this.deleteFromList("permawatch", id, collection, true);
        const favourites = this.deleteFromList("favorites", id, collection, true);
        const hidden = this.deleteFromList("hidden", id, collection, true);
        const pinned = this.deleteFromList("pinned", id, collection, true);

        const list = this.deleteFromList(listName, id, collection, true);
        list.push({ id: id, collection: collection, rev: rev });

        const lists = { deferred, permawatch, favourites, hidden, pinned, [listName]: list };
        store.dispatch(settingsUpdate({ lists }));
    }

    public static pushStrings(listName: TLists, word: string) {
        const list = store.getState().settings.lists[listName] || [];

        list.push({ id: Math.random(), rev: 0, word: word });

        store.dispatch(settingsListUpdate(listName, list));
    }

    //TODO: review stopUpdate
    public static deleteFromList(listName: TLists, id: number, collection: string, stopUpdate?: boolean) {
        let l = getListsSelector(listName)(store.getState()); // store.getList(list);

        if (!l.some((x) => x.id === id && x.collection === collection)) return l;

        l = l.filter((x) => `${x.collection}-${x.id}` !== `${collection}-${id}`);
        if (!stopUpdate) {
            store.dispatch(settingsListUpdate(listName, l));
        }
        return l;
    }

    public static clearList(listName: TLists) {
        console.log("==CLEAR LIST");
        store.dispatch(settingsListUpdate(listName, []));
    }

    public static isIn(listName: TLists, collection: string, id: number, rev?: number, word?: string) {
        return !!getListsSelector(listName)(store.getState()).find((x) => {
            if (listName === "keywords" && x.word && word) return x.word.toLowerCase() === word.toLowerCase();
            else return (collection ? x.collection === collection : true) && x.id === id && (rev ? x.rev === rev : true);
        });
    }

    public static isInText(listName: TLists, name: string) {
        return !!getListsSelector(listName)(store.getState()).find((x) => {
            if (listName === "keywords" && x.word) return name.toLowerCase().indexOf(x.word.toLowerCase()) !== -1;
            else return null;
        });
    }

    public static setNote(collection: string, id: number, note: string, color?: string) {
        let notes = store.getState().settings.notes || [];

        let existingNote = notes.find((n) => n.id === id && collection === n.collection);
        notes = notes.filter((x) => `${x.collection}-${x.id}` !== `${collection}-${id}`);

        if (note) {
            if (!existingNote) existingNote = { id: id, collection: collection, note: note, color: color };
            else {
                existingNote.note = note;
                existingNote.color = color;
            }
            notes.push(existingNote);
        }

        store.dispatch(settingsUpdate({ notes }));
    }

    public static getNote(collection: string, id: number) {
        let notes = store.getState().settings.notes;
        let existingNote = notes.find((n) => n.id === id && collection === n.collection);
        if (existingNote) return existingNote.note;
        return undefined;
    }

    public static getNoteColor(collection: string, id: number) {
        let notes = store.getState().settings.notes;
        let existingNote = notes.find((n) => n.id === id && collection === n.collection);
        if (existingNote) return existingNote.color;
        return undefined;
    }
}
