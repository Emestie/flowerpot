import { Project } from "../models/project";
import { Query } from "../models/query";
import { TLocale } from "../types";
import { useAppStore } from "../zustand/app";
import { Sections, TableScale, useSettingsStore } from "../zustand/settings";
import { AccountBadge } from "./Account";
import { ILinkItem } from "./Links";
import Platform from "./Platform";

export type TSortPattern = "default" | "assignedto" | "id";
export type TNotificationsMode = "all" | "mine" | "none";
export type TTheme = "light" | "dark" | "system";
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
    projects: Project[];
    queries: Query[];
    lists: {
        [K in TLists]: IListItem[];
    };
    notes: INoteItem[];
    links: ILinkItem[];
    hiddenPrs: IHiddenPr[];
    theme: TTheme;
    /** @deprecated Use `theme` instead */
    darkTheme: boolean | undefined;
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
    showEmptyQueries: boolean;
}

export default class Settings {
    public static async read() {
        const settings = await Platform.current.getStoreProp<string>("flowerpot");
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                useSettingsStore.getState().setSettings(parsedSettings);
            } catch (e: any) {}
        }

        const autostart = await Platform.current.getStoreProp<boolean>("autostart");
        const locale = await Platform.current.getStoreProp<TLocale>("locale");

        useAppStore.getState().setSettings({ autostart, locale });
    }

    public static save(settings: ISettings) {
        try {
            const settingsToStore = JSON.stringify(settings);
            Platform.current.setStoreProp("flowerpot", settingsToStore);
        } catch (e: any) {}
    }
}
