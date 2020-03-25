import { TLists } from "./Settings";
import store from "../store";

export default class Lists {
    public static push(list: TLists, id:number, rev?: number) {
        if (!rev) rev = 0;

        //remove from other lists if item in them
        this.deleteFromList("deferred", id);
        this.deleteFromList("permawatch", id);
        this.deleteFromList("favorites", id);
        this.deleteFromList("hidden", id);

        store.settings.lists[list].push({ id: id, rev: rev });
        store.updateSettings();
    }

    public static pushStrings(list: TLists, word: string){
        if (!store.settings.lists[list]) store.settings.lists[list] = [];
        store.settings.lists[list].push({id: Math.random(), rev: 0, word: word});
        store.updateSettings();
    }

    public static deleteFromList(list: TLists, id: number) {
        let l = store.getList(list);
        l = l.filter(x => x.id !== id);
        store.settings.lists[list] = l;
        store.updateSettings();
    }

    public static clearList(list: TLists) {
        store.settings.lists[list] = [];
        store.updateSettings();
    }

    public static isIn(list: TLists, id: number, rev?: number, word?: string) {
        return !!store.getList(list).find(x => {
            if (list === "keywords" && x.word && word) return x.word.toLowerCase() === word.toLowerCase();
            else return x.id === id && (rev ? x.rev === rev : true)});
    }

    public static isInText(list: TLists, name: string) {
        return !!store.getList(list).find(x => {
            if (list === "keywords" && x.word) return name.toLowerCase().indexOf(x.word.toLowerCase()) !== -1;
        })
    }

    public static setNote(id: number, note: string, color?: string) {
        let notes = store.copy(store.settings.notes);

        let existingNote = notes.find(n => n.id === id);
        notes = notes.filter(n => n.id !== id);

        if (note) {
            if (!existingNote) existingNote = { id: id, note: note, color: color };
            else {
                existingNote.note = note;
                existingNote.color = color;
            }
            notes.push(existingNote);
        }

        store.settings.notes = notes;
        store.updateSettings();
    }

    public static getNote(id: number) {
        let notes = store.settings.notes;
        let existingNote = notes.find(n => n.id === id);
        if (existingNote) return existingNote.note;
        return undefined;
    }

    public static getNoteColor(id: number) {
        let notes = store.settings.notes;
        let existingNote = notes.find(n => n.id === id);
        if (existingNote) return existingNote.color;
        return undefined;
    }
}
