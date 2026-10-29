import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Platform from "../helpers/Platform";
import TrayIcon from "../helpers/TrayIcon";
import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import { makeQuery, makeWorkItem, resetStores } from "./test-utils";

const LEVEL_GREY = 0;
const LEVEL_RED = 1;
const LEVEL_ITEMS = 3;
const LEVEL_EMPTY = 4;

let published: Array<{ level: number; hasChanges: boolean }>;

/** Lets the settle timer and the round timeout run. */
async function settle(ms = 1000) {
    await vi.advanceTimersByTimeAsync(ms);
}

function makeRed(query: Query, id: number) {
    return makeWorkItem(query, { id, priority: 1 });
}

function load(query: Query, items: WorkItem[]) {
    TrayIcon.markQueryLoading(query.queryId);
    TrayIcon.setQueryItems(query, items);
}

function levels() {
    return published.map((p) => p.level);
}

beforeEach(() => {
    vi.useFakeTimers();
    resetStores();
    TrayIcon.reset();
    TrayIcon.init();

    published = [];
    vi.spyOn(Platform.current, "updateTrayIcon").mockImplementation((level: number, hasChanges?: boolean) => {
        published.push({ level, hasChanges: !!hasChanges });
    });
});

afterEach(() => {
    TrayIcon.reset();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("TrayIcon", () => {
    it("stays grey until the first query delivers its items", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        useSettingsStore.getState().setQueries([q1]);

        TrayIcon.markQueryLoading("q1");
        await settle();
        expect(published).toEqual([]);

        TrayIcon.setQueryItems(q1, [makeWorkItem(q1, { id: 1 })]);
        await settle();

        expect(levels()).toEqual([LEVEL_ITEMS]);
    });

    it("turns red when a priority 1 item is present and goes back once it is gone", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        useSettingsStore.getState().setQueries([q1]);

        load(q1, [makeRed(q1, 1)]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED]);

        load(q1, [makeWorkItem(q1, { id: 2 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED, LEVEL_ITEMS]);

        load(q1, []);
        await settle();
        expect(levels()).toEqual([LEVEL_RED, LEVEL_ITEMS, LEVEL_EMPTY]);
    });

    it("does not repaint for the same state", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        useSettingsStore.getState().setQueries([q1]);

        load(q1, [makeWorkItem(q1, { id: 1 })]);
        await settle();
        load(q1, [makeWorkItem(q1, { id: 2 })]);
        await settle();

        expect(levels()).toEqual([LEVEL_ITEMS]);
    });

    it("does not flash red in the middle of a refresh round", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        const q2 = makeQuery("acc", "", { queryId: "q2" });
        useSettingsStore.getState().setQueries([q1, q2]);

        //first round: q1 has a priority 1 item
        load(q1, [makeRed(q1, 1)]);
        load(q2, [makeWorkItem(q2, { id: 2 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED]);

        //second round: q2 is back first, q1 still holds the old red item
        load(q2, [makeWorkItem(q2, { id: 2 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED]);

        //q1 finally refreshes without the red item: a single repaint, no flash
        load(q1, [makeWorkItem(q1, { id: 1 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED, LEVEL_ITEMS]);
    });

    it("counts no work items of a disabled query", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        const q2 = makeQuery("acc", "", { queryId: "q2" });
        useSettingsStore.getState().setQueries([q1, q2]);

        load(q1, [makeWorkItem(q1, { id: 1 })]);
        load(q2, [makeRed(q2, 2)]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED]);

        q2.enabled = false;
        useSettingsStore.getState().setQueries([q1, q2]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED, LEVEL_ITEMS]);
    });

    it("counts no work items of a query with the ignore icon flag", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        const q2 = makeQuery("acc", "", { queryId: "q2" });
        q2.ignoreIcon = true;
        useSettingsStore.getState().setQueries([q1, q2]);

        load(q1, [makeWorkItem(q1, { id: 1 })]);
        load(q2, [makeRed(q2, 2)]);
        await settle();

        expect(levels()).toEqual([LEVEL_ITEMS]);
    });

    it("still counts a query that only ignores notifications", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        q1.ignoreNotif = true;
        useSettingsStore.getState().setQueries([q1]);

        load(q1, [makeRed(q1, 1)]);
        await settle();

        expect(levels()).toEqual([LEVEL_RED]);
    });

    it("shows green when every query is disabled", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        useSettingsStore.getState().setQueries([q1]);

        load(q1, [makeWorkItem(q1, { id: 1 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_ITEMS]);

        q1.enabled = false;
        useSettingsStore.getState().setQueries([q1]);
        await settle();
        expect(levels()).toEqual([LEVEL_ITEMS, LEVEL_EMPTY]);
    });

    it("shows green when every query is set to ignore icon, even before the first load", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        q1.ignoreIcon = true;
        useSettingsStore.getState().setQueries([q1]);

        await settle();

        expect(levels()).toEqual([LEVEL_EMPTY]);
    });

    it("keeps the icon green when the only watched-in-name query with a priority 1 item is ignored", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        q1.ignoreIcon = true;
        useSettingsStore.getState().setQueries([q1]);

        load(q1, [makeRed(q1, 1)]);
        await settle();

        expect(levels()).toEqual([LEVEL_EMPTY]);
    });

    it("applies the my-items-only setting to both the level and the changes dot", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        useSettingsStore.getState().setQueries([q1]);
        useSettingsStore.getState().setIconChangesOnMyWorkItemsOnly(true);

        const foreignRed = makeRed(q1, 1);
        foreignRed._isMine = false;
        useDataStore.getState().setChangesCollectionItem(foreignRed, true);

        const mine = makeWorkItem(q1, { id: 2 });
        mine._isMine = true;

        load(q1, [foreignRed, mine]);
        await settle();

        //the red item belongs to somebody else: no red, and its change does not set the dot
        expect(published).toEqual([{ level: LEVEL_ITEMS, hasChanges: false }]);

        useDataStore.getState().setChangesCollectionItem(mine, true);
        load(q1, [foreignRed, mine]);
        await settle();

        expect(published).toEqual([
            { level: LEVEL_ITEMS, hasChanges: false },
            { level: LEVEL_ITEMS, hasChanges: true },
        ]);
    });

    it("publishes again after a forced level (error screen, debug tools)", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        useSettingsStore.getState().setQueries([q1]);

        load(q1, [makeWorkItem(q1, { id: 1 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_ITEMS]);

        TrayIcon.forceLevel(LEVEL_GREY, false);
        expect(levels()).toEqual([LEVEL_ITEMS, LEVEL_GREY]);

        load(q1, [makeWorkItem(q1, { id: 1 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_ITEMS, LEVEL_GREY, LEVEL_ITEMS]);
    });

    it("publishes when a round takes too long", async () => {
        const q1 = makeQuery("acc", "", { queryId: "q1" });
        const q2 = makeQuery("acc", "", { queryId: "q2" });
        useSettingsStore.getState().setQueries([q1, q2]);

        load(q1, [makeRed(q1, 1)]);
        load(q2, [makeWorkItem(q2, { id: 2 })]);
        await settle();
        expect(levels()).toEqual([LEVEL_RED]);

        //q1 lost its red item, q2 hangs and never reports back
        load(q1, [makeWorkItem(q1, { id: 1 })]);
        TrayIcon.markQueryLoading("q2");
        await settle(16000);

        expect(levels()).toEqual([LEVEL_RED, LEVEL_ITEMS]);
    });
});
