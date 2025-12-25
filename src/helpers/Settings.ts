import { IProject, IQuery } from "../modules/api-client";
import { appSet } from "../redux/actions/appActions";
import { settingsSet } from "../redux/actions/settingsActions";
import { Sections, TableScale } from "../redux/reducers/settingsReducer";
import { store } from "../redux/store";
import { TLocale } from "../redux/types";
import { AccountBadge } from "./Account";
import { ILinkItem } from "./Links";
import Platform from "./Platform";

export type TSortPattern = "default" | "assignedto" | "id";
export type TNotificationsMode = "all" | "mine" | "none";
export type TLists = "permawatch" | "favorites" | "deferred" | "hidden" | "keywords" | "pinned" | "forwarded";

export interface IAccount {
    url: string;
    token: string;
    id: string;
    displayName: string;
    descriptor: string | undefined;
    badge: AccountBadge;
}

export interface IListItem {
    accountId: string;
    id: number;
    rev: number;
    word?: string;
    collection?: string;
}

interface INoteItem {
    accountId: string;
    collection: string;
    id: number;
    note: string;
    color?: string;
}

interface IHiddenPr {
    accountId: string;
    collection: string;
    id: number;
}

export interface ISettings {
    /** @deprecated */
    tfsPath: string;
    /** @deprecated */
    tfsToken: string;
    accounts: IAccount[];
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
    hiddenPrs: IHiddenPr[];
    darkTheme: boolean;
    allowTelemetry: boolean;
    showUnreads: boolean;
    showQuickLinks: boolean;
    lastTimeVersion: string;
    lastTimeVersionLong: string;
    migrationsDone: string[];
    bannersShown: number[];
    settingsSection: Sections;
    includeTeamsPRs: boolean;
    includeAcceptedByMePRs: boolean;
    includeHiddenPRs: boolean;
    enableIterationColors: boolean;
    enableQueryColorCode: boolean;
    collapsedBlocks: string[];
    openByIdLastCollection: string | undefined;
    openByIdLastAccountId: string | undefined;
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
