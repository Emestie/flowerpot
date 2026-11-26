import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Differences from "../helpers/Differences";
import QueryHelper from "../helpers/Query";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import { makeAccount, makeQuery, makeWorkItem, resetStores } from "./test-utils";

const ACCOUNT_ID = "account-1";
const COLLECTION = "MyCollection";

function makeStoredPullRequest(options?: { id?: number; commitId?: string }) {
    return {
        id: options?.id ?? 100,
        commitId: options?.commitId ?? "commit-1",
        accountId: ACCOUNT_ID,
        collectionName: COLLECTION,
        //notifications are not under test; no belonging means "show nothing"
        getBelonging: () => null,
    } as any;
}

function makeQuotaError() {
    return new DOMException("The quota has been exceeded.", "QuotaExceededError");
}

beforeEach(() => {
    resetStores();
    useSettingsStore.setState({ accounts: [makeAccount("https://example.com/tfs/", ACCOUNT_ID)] });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("Differences storage snapshots", () => {
    it("persists only the fields needed to detect work item changes", () => {
        const query = makeQuery(ACCOUNT_ID, COLLECTION);
        useSettingsStore.setState({ queries: [query] });

        Differences.put(query, [makeWorkItem(query, { id: 7 })]);

        const storage = QueryHelper.getWIStorage();
        const stored = storage[query.queryId];

        expect(stored).toHaveLength(1);
        expect(Object.keys(stored![0]).sort()).toEqual(["id", "rev"]);
        expect(stored![0]).toEqual({ id: 7, rev: 2 });
    });

    it("persists only the fields needed to detect pull request changes", () => {
        Differences.putPRs(ACCOUNT_ID, [makeStoredPullRequest({ id: 12, commitId: "abc" })]);

        const storage = QueryHelper.getPRStorage();
        const stored = storage[ACCOUNT_ID];

        expect(stored).toHaveLength(1);
        expect(Object.keys(stored![0]).sort()).toEqual(["commitId", "id"]);
        expect(stored![0]).toEqual({ id: 12, commitId: "abc" });
    });

    it("still reads snapshots written by older versions with full models", () => {
        const query = makeQuery(ACCOUNT_ID, COLLECTION);
        useSettingsStore.setState({ queries: [query] });

        //old shape: whole WorkItem objects, of which only id/rev matter
        localStorage.setItem(
            "WIStorage",
            JSON.stringify({ [query.queryId]: [{ id: 7, rev: 2, title: "Test work item" }] })
        );

        Differences.put(query, [makeWorkItem(query, { id: 7 })]);

        expect(useDataStore.getState().changesCollection).toEqual({});
        expect(QueryHelper.getWIStorage()[query.queryId]).toEqual([{ id: 7, rev: 2 }]);
    });
});

describe("Differences storage quota", () => {
    beforeEach(() => {
        //what the browser throws when localStorage is full (the web build quota)
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw makeQuotaError();
        });
    });

    it("does not fail work item loading when the snapshot cannot be saved", () => {
        const query = makeQuery(ACCOUNT_ID, COLLECTION);
        useSettingsStore.setState({ queries: [query] });

        expect(() => Differences.put(query, [makeWorkItem(query, { id: 7 })])).not.toThrow();
    });

    it("does not fail pull request loading when the snapshot cannot be saved", () => {
        expect(() => Differences.putPRs(ACCOUNT_ID, [makeStoredPullRequest()])).not.toThrow();
    });

    it("does not fail when a changed pull request cannot be stored", () => {
        const pr = makeStoredPullRequest({ commitId: "new-commit" });
        //storage is read before the failing write, so seed it without setItem
        const getItem = vi
            .spyOn(Storage.prototype, "getItem")
            .mockReturnValue(JSON.stringify({ [ACCOUNT_ID]: [{ id: pr.id, commitId: "old-commit" }] }));

        expect(() => Differences.putPRs(ACCOUNT_ID, [pr])).not.toThrow();

        getItem.mockRestore();
    });
});
