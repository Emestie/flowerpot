import store from "../store";
import { IQuery } from "./Query";
import Electron from "./Electron";

export type TSortPattern = "default" | "assignedto" | "id";
export type TNotificationsMode = "all" | "mine" | "none";
export type TLists = "permawatch" | "favorites" | "deferred" | "hidden";

interface IListItem {
    id: number;
    rev: number;
}

interface INoteItem {
    id: number;
    note: string;
    color?: string;
}

export interface ISettings {
    tfsPath: string;
    tfsUser: string;
    tfsPwd: string;
    credentialsChecked: boolean;
    refreshRate: number;
    sortPattern: TSortPattern;
    notificationsMode: TNotificationsMode;
    iconChangesOnMyWorkItemsOnly: boolean;
    mineOnTop: boolean;
    queries: IQuery[];
    lists: {
        [K in TLists]: IListItem[];
    };
    notes: INoteItem[];
    darkTheme: boolean;
    allowTelemetry: boolean;
    lastTimeVersion: string;
}

export default class Settings {
    public static read() {
        let settings = Electron.getStoreProp("flowerpot");
        console.log("settings pulled", !!settings);
        if (settings) {
            try {
                let parsedSettings = JSON.parse(settings);
                store.setSettings(parsedSettings);
            } catch (e) {}
        }

        store.autostart = Electron.getStoreProp("autostart");
        store.locale = Electron.getStoreProp("locale");
    }

    public static save() {
        try {
            let settingsToStore = JSON.stringify(store.settings);
            Electron.setStoreProp("flowerpot", settingsToStore);
        } catch (e) {}
    }
}
