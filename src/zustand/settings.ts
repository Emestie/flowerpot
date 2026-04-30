import { create } from "zustand";
import Settings, {
    IAccount,
    IListItem,
    ISettings,
    TLists,
    TNotificationsMode,
    TSortPattern,
    TTheme,
} from "../helpers/Settings";
import { createLogger } from "./logger";

export enum TableScale {
    Small = 0,
    Medium = 1,
    Large = 2,
}

export enum Sections {
    Account = 0,
    Queries = 1,
    Projects = 2,
    Lists = 3,
    WorkItems = 4,
    QuickLinks = 5,
    Import = 6,
    Credits = 7,
}

export interface SettingsState extends ISettings {
    setSettings: (settings: Partial<ISettings>) => void;
    setAccounts: (accounts: IAccount[]) => void;
    setQueries: (queries: any[]) => void;
    setProjects: (projects: any[]) => void;
    setLists: (lists: ISettings["lists"]) => void;
    setList: (listName: TLists, items: IListItem[]) => void;
    setCollapsedBlocks: (collapsedBlocks: string[]) => void;
    toggleCollapsedBlock: (blockId: string) => void;
    setSettingsSection: (section: Sections) => void;
    setTheme: (theme: TTheme) => void;
    setRefreshRate: (refreshRate: number) => void;
    setSortPattern: (sortPattern: TSortPattern) => void;
    setNotificationsMode: (notificationsMode: TNotificationsMode) => void;
    setShowUnreads: (showUnreads: boolean) => void;
    setShowQuickLinks: (showQuickLinks: boolean) => void;
    setTableScale: (tableScale: TableScale) => void;
    setMineOnTop: (mineOnTop: boolean) => void;
    setIconChangesOnMyWorkItemsOnly: (iconChangesOnMyWorkItemsOnly: boolean) => void;
    setEnableIterationColors: (enableIterationColors: boolean) => void;
    setEnableQueryColorCode: (enableQueryColorCode: boolean) => void;
    setShowEmptyQueries: (showEmptyQueries: boolean) => void;
    setIncludeTeamsPRs: (include: boolean) => void;
    setIncludeAcceptedByMePRs: (include: boolean) => void;
    setIncludeHiddenPRs: (include: boolean) => void;
    setPrNotificationsEnabled: (enabled: boolean) => void;
    setAllowTelemetry: (allow: boolean) => void;
    setLastVersion: (version: string) => void;
    setLastVersionLong: (version: string) => void;
    setNotes: (notes: any[]) => void;
    setHiddenPrs: (hiddenPrs: any[]) => void;
    addMigration: (migration: string) => void;
}

const initialState: ISettings = {
    tfsPath: "",
    tfsToken: "",
    accounts: [],
    refreshRate: 600,
    sortPattern: "default",
    notificationsMode: "all",
    tableScale: TableScale.Small,
    iconChangesOnMyWorkItemsOnly: false,
    mineOnTop: true,
    projects: [],
    queries: [],
    lists: {
        permawatch: [],
        favorites: [],
        deferred: [],
        hidden: [],
        keywords: [],
        pinned: [],
        forwarded: [],
    },
    notes: [],
    links: [],
    hiddenPrs: [],
    theme: "system",
    darkTheme: undefined,
    allowTelemetry: true,
    showUnreads: true,
    showQuickLinks: true,
    lastTimeVersion: "",
    lastTimeVersionLong: "",
    migrationsDone: [],
    bannersShown: [],
    settingsSection: Sections.Account,
    includeTeamsPRs: true,
    includeAcceptedByMePRs: true,
    includeHiddenPRs: false,
    prNotificationsEnabled: true,
    enableIterationColors: true,
    enableQueryColorCode: false,
    collapsedBlocks: [],
    openByIdLastAccountId: undefined,
    openByIdLastCollection: undefined,
    showEmptyQueries: true,
};

const saveSettings = (state: ISettings) => {
    try {
        Settings.save(state);
    } catch (e) {}
};

export const useSettingsStore = create<SettingsState>()(
    createLogger("useSettingsStore", (set, get) => ({
        ...initialState,

        setSettings(settings) {
            const newState = { ...get(), ...settings };
            saveSettings(newState);
            set(newState);
        },

        setAccounts(accounts) {
            set({ accounts });
            saveSettings({ ...get(), accounts });
        },

        setQueries(queries) {
            set({ queries });
            saveSettings({ ...get(), queries });
        },

        setProjects(projects) {
            set({ projects });
            saveSettings({ ...get(), projects });
        },

        setLists(lists) {
            set({ lists });
            saveSettings({ ...get(), lists });
        },

        setList(listName, items) {
            const lists = { ...get().lists, [listName]: items };
            set({ lists });
            saveSettings({ ...get(), lists });
        },

        setCollapsedBlocks(collapsedBlocks) {
            set({ collapsedBlocks });
            saveSettings({ ...get(), collapsedBlocks });
        },

        toggleCollapsedBlock(blockId) {
            const collapsedBlocks = get().collapsedBlocks.includes(blockId)
                ? get().collapsedBlocks.filter((x) => x !== blockId)
                : [...get().collapsedBlocks, blockId];
            set({ collapsedBlocks });
            saveSettings({ ...get(), collapsedBlocks });
        },

        setSettingsSection(section) {
            set({ settingsSection: section });
        },

        setTheme(theme) {
            set({ theme });
            saveSettings({ ...get(), theme });
        },

        setRefreshRate(refreshRate) {
            set({ refreshRate });
            saveSettings({ ...get(), refreshRate });
        },

        setSortPattern(sortPattern) {
            set({ sortPattern });
            saveSettings({ ...get(), sortPattern });
        },

        setNotificationsMode(notificationsMode) {
            set({ notificationsMode });
            saveSettings({ ...get(), notificationsMode });
        },

        setShowUnreads(showUnreads) {
            set({ showUnreads });
            saveSettings({ ...get(), showUnreads });
        },

        setShowQuickLinks(showQuickLinks) {
            set({ showQuickLinks });
            saveSettings({ ...get(), showQuickLinks });
        },

        setTableScale(tableScale) {
            set({ tableScale });
            saveSettings({ ...get(), tableScale });
        },

        setMineOnTop(mineOnTop) {
            set({ mineOnTop });
            saveSettings({ ...get(), mineOnTop });
        },

        setIconChangesOnMyWorkItemsOnly(iconChangesOnMyWorkItemsOnly) {
            set({ iconChangesOnMyWorkItemsOnly });
            saveSettings({ ...get(), iconChangesOnMyWorkItemsOnly });
        },

        setEnableIterationColors(enableIterationColors) {
            set({ enableIterationColors });
            saveSettings({ ...get(), enableIterationColors });
        },

        setEnableQueryColorCode(enableQueryColorCode) {
            set({ enableQueryColorCode });
            saveSettings({ ...get(), enableQueryColorCode });
        },

        setShowEmptyQueries(showEmptyQueries) {
            set({ showEmptyQueries });
            saveSettings({ ...get(), showEmptyQueries });
        },

        setIncludeTeamsPRs(includeTeamsPRs) {
            set({ includeTeamsPRs });
            saveSettings({ ...get(), includeTeamsPRs });
        },

        setIncludeAcceptedByMePRs(includeAcceptedByMePRs) {
            set({ includeAcceptedByMePRs });
            saveSettings({ ...get(), includeAcceptedByMePRs });
        },

        setIncludeHiddenPRs(includeHiddenPRs) {
            set({ includeHiddenPRs });
            saveSettings({ ...get(), includeHiddenPRs });
        },

        setPrNotificationsEnabled(enabled) {
            set({ prNotificationsEnabled: enabled });
            saveSettings({ ...get(), prNotificationsEnabled: enabled });
        },

        setAllowTelemetry(allowTelemetry) {
            set({ allowTelemetry });
            saveSettings({ ...get(), allowTelemetry });
        },

        setLastVersion(lastTimeVersion) {
            set({ lastTimeVersion });
            saveSettings({ ...get(), lastTimeVersion });
        },

        setLastVersionLong(lastTimeVersionLong) {
            set({ lastTimeVersionLong });
            saveSettings({ ...get(), lastTimeVersionLong });
        },

        setNotes(notes) {
            set({ notes });
            saveSettings({ ...get(), notes });
        },

        setHiddenPrs(hiddenPrs) {
            set({ hiddenPrs });
            saveSettings({ ...get(), hiddenPrs });
        },

        addMigration(migration) {
            const migrationsDone = [...get().migrationsDone, migration];
            set({ migrationsDone });
            saveSettings({ ...get(), migrationsDone });
        },
    }))
);
