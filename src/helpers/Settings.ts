import { IQuery } from "./Query";
import Platform from "./Platform";
import { ILinkItem } from "./Links";
import { store } from "../redux/store";
import { settingsSet } from "../redux/actions/settingsActions";
import { appSettingsSet } from "../redux/actions/appActions";

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
        const settings = Platform.current.getStoreProp("flowerpot");
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                //store.setSettings(parsedSettings);
                store.dispatch(settingsSet(parsedSettings));
            } catch (e: any) {}
        }

        const autostart = Platform.current.getStoreProp("autostart");
        const locale = Platform.current.getStoreProp("locale");

        store.dispatch(appSettingsSet({ autostart, locale }));
    }

    public static save() {
        try {
            const settingsToStore = JSON.stringify(store.getState().settings);
            Platform.current.setStoreProp("flowerpot", settingsToStore);
        } catch (e: any) {}
    }
}
