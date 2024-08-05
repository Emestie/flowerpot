import { IProject, IQuery } from "../modules/api-client";
import { appSet } from "../redux/actions/appActions";
import { settingsSet } from "../redux/actions/settingsActions";
import { Sections, TableScale } from "../redux/reducers/settingsReducer";
import { store } from "../redux/store";
import { TLocale } from "../redux/types";
import { ILinkItem } from "./Links";
import Platform from "./Platform";
import { UsageStat } from "./Stats";

export type TSortPattern = "default" | "assignedto" | "id";
export type TNotificationsMode = "all" | "mine" | "none";
export type TLists = "permawatch" | "favorites" | "deferred" | "hidden" | "keywords" | "pinned" | "forwarded";

export interface IListItem {
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
    /** @deprecated */
    tfsUser?: string;
    /** @deprecated */
    tfsPwd?: string;
    tfsToken: string;
    credentialsChecked: boolean;
    refreshRate: number;
    sortPattern: TSortPattern;
    tableScale: TableScale;
    notificationsMode: TNotificationsMode;
    iconChangesOnMyWorkItemsOnly: boolean;
    mineOnTop: boolean;
    projects: IProject[];
    queries: IQuery[];
    lists: {
        [K in TLists]: IListItem[];
    };
    notes: INoteItem[];
    links: ILinkItem[];
    darkTheme: boolean;
    allowTelemetry: boolean;
    showUnreads: boolean;
    showQuickLinks: boolean;
    lastTimeVersion: string;
    lastTimeVersionLong: string;
    migrationsDone: string[];
    bannersShown: number[];
    stats: Record<UsageStat, number>;
    settingsSection: Sections;
    includeTeamsPRs: boolean;
    enableIterationColors: boolean;
    enableQueryColorCode: boolean;
}

export default class Settings {
    public static async read() {
        const settings = await Platform.current.getStoreProp<string>("flowerpot");
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                //store.setSettings(parsedSettings);
                store.dispatch(settingsSet(parsedSettings));
            } catch (e: any) {}
        }

        const autostart = await Platform.current.getStoreProp<boolean>("autostart");
        const locale = await Platform.current.getStoreProp<TLocale>("locale");

        store.dispatch(appSet({ autostart, locale }));
    }

    public static save(settings: ISettings) {
        try {
            const settingsToStore = JSON.stringify(settings);
            Platform.current.setStoreProp("flowerpot", settingsToStore);
        } catch (e: any) {}
    }
}
