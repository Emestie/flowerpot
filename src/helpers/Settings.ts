import store from "../store-mbx";
import { IQuery } from "./Query";
import Platform from "./Platform";
import { ILinkItem } from "./Links";

export type TSortPattern = "default" | "assignedto" | "id";
export type TNotificationsMode = "all" | "mine" | "none";
export type TLists = "permawatch" | "favorites" | "deferred" | "hidden" | "keywords" | "pinned";

interface IListItem {
    id: number;
    rev: number;
    word?: string;
    collection?: string;
}

interface INoteItem {
    collection: string;
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
    links: ILinkItem[];
    darkTheme: boolean;
    allowTelemetry: boolean;
    showWhatsNewOnUpdate: boolean;
    showUnreads: boolean;
    showAvatars: boolean;
    showQuickLinks: boolean;
    lastTimeVersion: string;
    lastTimeVersionLong: string;
    migrationsDone: string[];
    bannersShown: number[];
}

export default class Settings {
    public static read() {
        let settings = Platform.current.getStoreProp("flowerpot");
        if (settings) {
            try {
                let parsedSettings = JSON.parse(settings);
                store.setSettings(parsedSettings);
            } catch (e: any) {}
        }

        store.autostart = Platform.current.getStoreProp("autostart");
        store.locale = Platform.current.getStoreProp("locale");
    }

    public static save() {
        try {
            let settingsToStore = JSON.stringify(store.settings);
            Platform.current.setStoreProp("flowerpot", settingsToStore);
        } catch (e: any) {}
    }
}
