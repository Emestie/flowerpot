import { TLists } from "./Settings";
import { useSettingsStore } from "../zustand/settings";

export default class Lists {
    /** the order the rows and the work item model resolve a list in */
    private static order: TLists[] = ["deferred", "favorites", "pinned", "hidden", "permawatch", "forwarded"];

    public static push(accountId: string, listName: TLists, collection: string, id: number, rev?: number) {
        if (!rev) rev = 0;

        const deferred = this.deleteFromList(accountId, "deferred", id, collection, true);
        const permawatch = this.deleteFromList(accountId, "permawatch", id, collection, true);
        const favorites = this.deleteFromList(accountId, "favorites", id, collection, true);
        const hidden = this.deleteFromList(accountId, "hidden", id, collection, true);
        const pinned = this.deleteFromList(accountId, "pinned", id, collection, true);
        const forwarded = this.deleteFromList(accountId, "forwarded", id, collection, true);

        const list = [
            ...this.deleteFromList(accountId, listName, id, collection, true),
            { accountId, id, collection, rev },
        ];

        const lists = {
            ...useSettingsStore.getState().lists,
            deferred,
            permawatch,
            favorites,
            hidden,
            pinned,
            forwarded,
            [listName]: list,
        };

        useSettingsStore.getState().setLists(lists);
    }

    public static pushStrings(accountId: string, listName: TLists, word: string) {
        const list = useSettingsStore.getState().lists[listName] || [];

        useSettingsStore.getState().setList(listName, [...list, { accountId, id: Math.random(), rev: 0, word: word }]);
    }

    public static deleteFromList(
        accountId: string,
        listName: TLists,
        id: number,
        collection: string,
        stopUpdate?: boolean
    ) {
        let l = useSettingsStore.getState().lists[listName] || [];

        if (!l.some((x) => x.accountId === accountId && x.id === id && (x.collection || "") === collection)) return l;

        l = l.filter(
            (x) => `${x.accountId || ""}-${x.collection || ""}-${x.id}` !== `${accountId}-${collection}-${id}`
        );
        if (!stopUpdate) {
            useSettingsStore.getState().setList(listName, l);
        }
        return l;
    }

    public static clearList(listName: TLists) {
        useSettingsStore.getState().setList(listName, []);
    }

    public static isIn(
        accountId: string,
        listName: TLists,
        collection: string,
        id: number,
        rev?: number,
        word?: string
    ) {
        return !!(useSettingsStore.getState().lists[listName] || [])
            .filter((x) => (listName === "keywords" ? true : x.accountId === accountId))
            .find((x) => {
                if (listName === "keywords" && x.word && word) return x.word.toLowerCase() === word.toLowerCase();
                else
                    return (
                        (collection ? x.collection === collection : true) && x.id === id && (rev ? x.rev === rev : true)
                    );
            });
    }

    /**
     * The list the item is in right now, read from the settings instead of a cached
     * `WorkItem._list`: one item lives in several query blocks as separate instances, and a
     * change made through one of them is not written to the others.
     */
    public static getListOf(accountId: string, collection: string, id: number): TLists | undefined {
        return this.order.find((listName) => !!this.isIn(accountId, listName, collection, id));
    }

    public static isInText(accountId: string, listName: TLists, name: string) {
        return !!(useSettingsStore.getState().lists[listName] || [])
            .filter((x) => (listName === "keywords" ? true : x.accountId === accountId))
            .find((x) => {
                if (listName === "keywords" && x.word) return name.toLowerCase().indexOf(x.word.toLowerCase()) !== -1;
                else return null;
            });
    }

    public static setNote(accountId: string, collection: string, id: number, note: string, color?: string) {
        let notes = useSettingsStore.getState().notes || [];

        let existingNote = notes.find((n) => n.id === id && collection === n.collection);
        notes = notes.filter((x) => `${x.collection}-${x.id}` !== `${collection}-${id}`);

        if (note) {
            if (!existingNote) {
                notes = [...notes, { accountId, id, collection, note, color }];
            } else {
                notes = notes.map((n) => (n.id === id && collection === n.collection ? { ...n, note, color } : n));
            }
        }

        useSettingsStore.getState().setNotes(notes);
    }

    public static getNote(accountId: string, collection: string, id: number) {
        let notes = useSettingsStore.getState().notes;
        let existingNote = notes.find((n) => accountId === n.accountId && n.id === id && collection === n.collection);
        if (existingNote) return existingNote.note;
        return undefined;
    }

    public static getNoteColor(accountId: string, collection: string, id: number) {
        let notes = useSettingsStore.getState().notes;
        let existingNote = notes.find((n) => accountId === n.accountId && n.id === id && collection === n.collection);
        if (existingNote) return existingNote.color;
        return undefined;
    }

    public static setPrAsHidden(accountId: string, collection: string, prId: number) {
        const hiddenPrs = useSettingsStore.getState().hiddenPrs || [];

        useSettingsStore.getState().setHiddenPrs([...hiddenPrs, { accountId, collection, id: prId }]);
    }

    public static removePrFromHidden(accountId: string, collection: string, prId: number) {
        const hiddenPrs = useSettingsStore.getState().hiddenPrs || [];
        const updated = hiddenPrs.filter(
            (pr) => !(pr.id === prId && pr.accountId === accountId && pr.collection === collection)
        );

        useSettingsStore.getState().setHiddenPrs(updated);
    }

    public static isPrHidden(accountId: string, collection: string, prId: number) {
        return !!(useSettingsStore.getState().hiddenPrs || []).find(
            (pr) => pr.id === prId && pr.accountId === accountId && pr.collection === collection
        );
    }
}
