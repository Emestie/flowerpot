import { settingsListUpdate, settingsUpdate } from "../redux/actions/settingsActions";
import { getListsSelector } from "../redux/selectors/settingsSelectors";
import { store } from "../redux/store";
import { TLists } from "./Settings";

export default class Lists {
    public static push(accountId: string, listName: TLists, collection: string, id: number, rev?: number) {
        if (!rev) rev = 0;

        //remove from other lists if item in them
        const deferred = this.deleteFromList(accountId, "deferred", id, collection, true);
        const permawatch = this.deleteFromList(accountId, "permawatch", id, collection, true);
        const favorites = this.deleteFromList(accountId, "favorites", id, collection, true);
        const hidden = this.deleteFromList(accountId, "hidden", id, collection, true);
        const pinned = this.deleteFromList(accountId, "pinned", id, collection, true);
        const forwarded = this.deleteFromList(accountId, "forwarded", id, collection, true);

        const list = this.deleteFromList(accountId, listName, id, collection, true);
        list.push({ accountId, id, collection, rev });

        const lists = { deferred, permawatch, favorites, hidden, pinned, forwarded, [listName]: list } as any;

        store.dispatch(settingsUpdate({ lists }));
    }

    public static pushStrings(accountId: string, listName: TLists, word: string) {
        const list = store.getState().settings.lists[listName] || [];

        list.push({ accountId, id: Math.random(), rev: 0, word: word });

        store.dispatch(settingsListUpdate(listName, list));
    }

    public static deleteFromList(
        accountId: string,
        listName: TLists,
        id: number,
        collection: string,
        stopUpdate?: boolean
    ) {
        let l = getListsSelector(listName)(store.getState()); // store.getList(list);

        if (!l.some((x) => x.accountId === accountId && x.id === id && (x.collection || "") === collection)) return l;

        l = l.filter(
            (x) => `${x.accountId || ""}-${x.collection || ""}-${x.id}` !== `${accountId}-${collection}-${id}`
        );
        if (!stopUpdate) {
            store.dispatch(settingsListUpdate(listName, l));
        }
        return l;
    }

    public static clearList(listName: TLists) {
        store.dispatch(settingsListUpdate(listName, []));
    }

    public static isIn(
        accountId: string,
        listName: TLists,
        collection: string,
        id: number,
        rev?: number,
        word?: string
    ) {
        return !!getListsSelector(listName)(store.getState())
            .filter((x) => (listName === "keywords" ? true : x.accountId === accountId))
            .find((x) => {
                if (listName === "keywords" && x.word && word) return x.word.toLowerCase() === word.toLowerCase();
                else
                    return (
                        (collection ? x.collection === collection : true) && x.id === id && (rev ? x.rev === rev : true)
                    );
            });
    }

    public static isInText(accountId: string, listName: TLists, name: string) {
        return !!getListsSelector(listName)(store.getState())
            .filter((x) => (listName === "keywords" ? true : x.accountId === accountId))
            .find((x) => {
                if (listName === "keywords" && x.word) return name.toLowerCase().indexOf(x.word.toLowerCase()) !== -1;
                else return null;
            });
    }

    public static setNote(accountId: string, collection: string, id: number, note: string, color?: string) {
        let notes = store.getState().settings.notes || [];

        let existingNote = notes.find((n) => n.id === id && collection === n.collection);
        notes = notes.filter((x) => `${x.collection}-${x.id}` !== `${collection}-${id}`);

        if (note) {
            if (!existingNote) existingNote = { accountId, id, collection, note, color };
            else {
                existingNote.note = note;
                existingNote.color = color;
            }
            notes.push(existingNote);
        }

        store.dispatch(settingsUpdate({ notes }));
    }

    public static getNote(accountId: string, collection: string, id: number) {
        let notes = store.getState().settings.notes;
        let existingNote = notes.find((n) => accountId === n.accountId && n.id === id && collection === n.collection);
        if (existingNote) return existingNote.note;
        return undefined;
    }

    public static getNoteColor(accountId: string, collection: string, id: number) {
        let notes = store.getState().settings.notes;
        let existingNote = notes.find((n) => n.accountId === accountId && n.id === id && collection === n.collection);
        if (existingNote) return existingNote.color;
        return undefined;
    }

    public static setPrAsHidden(accountId: string, collection: string, prId: number) {
        const hiddenPrs = store.getState().settings.hiddenPrs || [];

        store.dispatch(settingsUpdate({ hiddenPrs: [...hiddenPrs, { accountId, collection, id: prId }] }));
    }

    public static removePrFromHidden(accountId: string, collection: string, prId: number) {
        const hiddenPrs = store.getState().settings.hiddenPrs || [];
        const updated = hiddenPrs.filter(
            (pr) => !(pr.id === prId && pr.accountId === accountId && pr.collection === collection)
        );

        store.dispatch(settingsUpdate({ hiddenPrs: updated }));
    }

    public static isPrHidden(accountId: string, collection: string, prId: number) {
        return !!(store.getState().settings.hiddenPrs || []).find(
            (pr) => pr.id === prId && pr.accountId === accountId && pr.collection === collection
        );
    }
}
