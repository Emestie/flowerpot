import { Project } from "../models/project";
import { Query } from "../models/query";
import { TLocale } from "../types";
import { useAppStore } from "../zustand/app";
import { Sections, TableScale, useSettingsStore } from "../zustand/settings";
import { AccountBadge } from "./Account";
import { ILinkItem } from "./Links";
import Platform from "./Platform";

export type TSortPattern = "query" | "default" | "assignedto" | "id";
export type TNotificationsMode = "all" | "mine" | "none";
export type TTheme = "light" | "dark" | "system";
export type TColorScheme = "classic" | "flexoki";
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
    colorScheme: TColorScheme;
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
    includeDraftPRs: boolean;
    prNotifications: string;
    enableIterationColors: boolean;
    enableQueryColorCode: boolean;
    collapsedBlocks: string[];
    openByIdLastCollection: string | undefined;
    openByIdLastAccountId: string | undefined;
    showEmptyQueries: boolean;
}

export default class Settings {
    /** Settings may only be written back after the stored ones were read. */
    private static loaded = false;
    private static warnedEarlySave = false;

    public static async read() {
        try {
            const settings = await Platform.current.getStoreProp<string>("flowerpot");
            if (settings) {
                try {
                    const parsedSettings = JSON.parse(settings);
                    useSettingsStore.getState().setSettings(parsedSettings);
                } catch (e: any) {
                    console.error("Failed to parse stored settings:", e);
                }
            }

            const autostart = await Platform.current.getStoreProp<boolean>("autostart");
            const locale = await Platform.current.getStoreProp<TLocale>("locale");

            useAppStore.getState().setSettings({ autostart, locale });
        } catch (e: any) {
            console.error("Failed to read settings:", e);
        }

        try {
            const status = await Platform.current.getSettingsStatus();
            if (status) useAppStore.getState().setSettings({ settingsStatus: status });
        } catch (e: any) {
            console.error("Failed to read settings file status:", e);
        } finally {
            Settings.loaded = true;
        }
    }

    public static async save(settings: ISettings) {
        // Anything saved before read() has finished would put the default state
        // (no accounts, no queries) on top of the user's real settings.
        if (!Settings.loaded) {
            if (!Settings.warnedEarlySave) {
                Settings.warnedEarlySave = true;
                console.warn("Settings.save() called before Settings.read(), skipping.");
            }
            return;
        }

        try {
            const settingsToStore = JSON.stringify(settings);
            Platform.current.setStoreProp("flowerpot", settingsToStore);
        } catch (e: any) {
            console.error("Failed to save settings:", e);
        }
    }
}
