import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContextMenu } from "../ui/context-menu";
import Lists from "../helpers/Lists";
import QueryHelper from "../helpers/Query";
import TrayIcon from "../helpers/TrayIcon";
import { permawatchMembershipKey, syncPermawatchQuery } from "../helpers/permawatch";
import { useQueryLoader } from "../hooks/useQueryLoader";
import { useQueriesForBlocks } from "../hooks/useQueriesForBlocks";
import type { Query } from "../models/query";
import { useAppStore } from "../zustand/app";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import { WorkItemRowContextMenu } from "../components/work-items/WorkItemRowContextMenu";
import { s } from "../values/Strings";
import { CLOUD_URL, makeAccount, makeQuery, makeWorkItem, resetStores } from "./test-utils";

const { getByQueryMock } = vi.hoisted(() => ({ getByQueryMock: vi.fn() }));

vi.mock("../api/client", () => ({
    getApi: () => ({ workItem: { getByQuery: getByQueryMock } }),
}));

const ACCOUNT_ID = "acc1";
const emptyResult = { workItems: [], hiddenCount: 0 };

beforeEach(() => {
    resetStores();
    getByQueryMock.mockReset();
    getByQueryMock.mockResolvedValue(emptyResult);
});

afterEach(() => {
    cleanup();
    TrayIcon.reset();
    vi.restoreAllMocks();
});

/** Renders nothing, only wires the loader of one query the way WorkItemsBlock does. */
function LoaderHarness({ query }: { query: Query }) {
    useQueryLoader(query);
    return null;
}

/** Lists the blocks MainView would render. */
function QueriesHarness() {
    const queries = useQueriesForBlocks();

    return (
        <div>
            {queries.map((q) => (
                <span key={q.queryId} data-testid="query">
                    {q.queryId}
                </span>
            ))}
        </div>
    );
}

describe("permawatchMembershipKey", () => {
    it("ignores the order of the list and the entries of other accounts", () => {
        const items = [
            { accountId: ACCOUNT_ID, id: 2, rev: 0, collection: "" },
            { accountId: ACCOUNT_ID, id: 1, rev: 0, collection: "Collection2020" },
            { accountId: "acc2", id: 3, rev: 0, collection: "" },
        ];

        expect(permawatchMembershipKey(items, ACCOUNT_ID)).toBe(
            permawatchMembershipKey([...items].reverse(), ACCOUNT_ID)
        );
        expect(permawatchMembershipKey(items, ACCOUNT_ID)).toBe("#2,Collection2020#1");
        expect(permawatchMembershipKey(undefined, ACCOUNT_ID)).toBe("");
    });

    it("changes when an entry is added or removed", () => {
        const one = permawatchMembershipKey([{ accountId: ACCOUNT_ID, id: 1, rev: 0 }], ACCOUNT_ID);
        const two = permawatchMembershipKey(
            [
                { accountId: ACCOUNT_ID, id: 1, rev: 0 },
                { accountId: ACCOUNT_ID, id: 2, rev: 0 },
            ],
            ACCOUNT_ID
        );

        expect(one).not.toBe(two);
        expect(permawatchMembershipKey([], ACCOUNT_ID)).toBe("");
    });
});

describe("syncPermawatchQuery", () => {
    it("drops what left the list and shows what another query already loaded", () => {
        const otherQuery = makeQuery(ACCOUNT_ID, "Collection2020", { queryId: "q-other" });
        const permawatchQuery = makeQuery(ACCOUNT_ID, "", { queryId: "___permawatch_acc1" });

        const stale = makeWorkItem(permawatchQuery, { id: 1 });
        const added = makeWorkItem(otherQuery, { id: 2 });
        useDataStore.setState({ workItems: [stale, added] });

        const entry = { accountId: ACCOUNT_ID, id: 2, rev: added.rev, collection: "Collection2020" };
        useSettingsStore.getState().setList("permawatch", [entry]);

        syncPermawatchQuery(permawatchQuery);

        const permawatchItems = useDataStore.getState().getWorkItemsForQuery(permawatchQuery);
        expect(permawatchItems.map((wi) => wi.id)).toEqual([2]);
        expect(permawatchItems[0]._list).toBe("permawatch");
        expect(permawatchItems[0]._collectionName).toBe("Collection2020");

        //the query the item was taken from keeps its own instance
        expect(
            useDataStore
                .getState()
                .getWorkItemsForQuery(otherQuery)
                .map((wi) => wi.id)
        ).toEqual([2]);
        expect(useDataStore.getState().getWorkItemsForQuery(otherQuery)[0]).toBe(added);
    });

    it("leaves the store alone when the membership did not change", () => {
        const permawatchQuery = makeQuery(ACCOUNT_ID, "", { queryId: "___permawatch_acc1" });
        const item = makeWorkItem(permawatchQuery, { id: 7 });
        useDataStore.setState({ workItems: [item] });
        useSettingsStore.getState().setList("permawatch", [{ accountId: ACCOUNT_ID, id: 7, rev: item.rev }]);

        const before = useDataStore.getState().workItems;
        syncPermawatchQuery(permawatchQuery);

        expect(useDataStore.getState().workItems).toBe(before);
    });
});

describe("permawatch block", () => {
    it("appears as soon as the list has an item and disappears when it empties", () => {
        useSettingsStore.getState().setAccounts([makeAccount(CLOUD_URL, ACCOUNT_ID)]);
        render(<QueriesHarness />);

        expect(screen.queryByTestId("query")).toBeNull();

        act(() => {
            Lists.push(ACCOUNT_ID, "permawatch", "", 1, 1);
        });

        expect(screen.getByTestId("query").textContent).toBe("___permawatch_acc1");

        act(() => {
            Lists.deleteFromList(ACCOUNT_ID, "permawatch", 1, "");
        });

        expect(screen.queryByTestId("query")).toBeNull();
    });

    it("reloads itself when the list changes instead of waiting for the refresh round", async () => {
        useSettingsStore.getState().setAccounts([makeAccount(CLOUD_URL, ACCOUNT_ID)]);
        useSettingsStore.getState().setList("permawatch", [{ accountId: ACCOUNT_ID, id: 1, rev: 1 }]);

        const query = QueryHelper.getFakePermawatchQuery(ACCOUNT_ID);
        render(<LoaderHarness query={query} />);

        await waitFor(() => expect(getByQueryMock).toHaveBeenCalledTimes(1));

        act(() => {
            Lists.push(ACCOUNT_ID, "permawatch", "", 2, 3);
        });

        await waitFor(() => expect(getByQueryMock).toHaveBeenCalledTimes(2));
    });

    it("does not reload a regular query when the permawatch list changes", async () => {
        useSettingsStore.getState().setAccounts([makeAccount(CLOUD_URL, ACCOUNT_ID)]);
        useSettingsStore.getState().setList("permawatch", [{ accountId: ACCOUNT_ID, id: 1, rev: 1 }]);

        const query = makeQuery(ACCOUNT_ID, "Collection2020");
        render(<LoaderHarness query={query} />);

        await waitFor(() => expect(getByQueryMock).toHaveBeenCalledTimes(1));

        act(() => {
            Lists.push(ACCOUNT_ID, "permawatch", "", 2, 3);
        });

        await waitFor(() => expect(useSettingsStore.getState().lists.permawatch).toHaveLength(2));
        expect(getByQueryMock).toHaveBeenCalledTimes(1);
    });
});

describe("work item context menu", () => {
    function MenuHarness({ query, workItem }: { query: Query; workItem: ReturnType<typeof makeWorkItem> }) {
        const menu = useContextMenu();

        return (
            <div>
                <div data-testid="row" onContextMenu={menu.open}>
                    row
                </div>
                <WorkItemRowContextMenu menu={menu} query={query} workItem={workItem} onUpdate={() => undefined} />
            </div>
        );
    }

    it("adds an item to permawatch without leaving the view", () => {
        const query = makeQuery(ACCOUNT_ID, "Collection2020");
        const workItem = makeWorkItem(query, { id: 42 });
        useAppStore.setState({ view: "main" });

        render(<MenuHarness query={query} workItem={workItem} />);
        fireEvent.contextMenu(screen.getByTestId("row"));
        fireEvent.click(screen.getByText(s("addToP")));

        expect(useSettingsStore.getState().lists.permawatch.map((x) => x.id)).toEqual([42]);
        expect(useAppStore.getState().view).toBe("main");
        expect(workItem._list).toBe("permawatch");
    });

    it("removes an item from permawatch without leaving the view", () => {
        const query = makeQuery(ACCOUNT_ID, "Collection2020");
        const workItem = makeWorkItem(query, { id: 42 });
        Lists.push(ACCOUNT_ID, "permawatch", workItem._collectionName, workItem.id, workItem.rev);
        workItem._list = "permawatch";
        useAppStore.setState({ view: "main" });

        render(<MenuHarness query={query} workItem={workItem} />);
        fireEvent.contextMenu(screen.getByTestId("row"));
        fireEvent.click(screen.getByText(`${s("removeFromList")}"${s("permawatch")}"`));

        expect(useSettingsStore.getState().lists.permawatch).toHaveLength(0);
        expect(useAppStore.getState().view).toBe("main");
        expect(workItem._list).toBeUndefined();
    });

    it("offers only the removal inside the permawatch block", () => {
        const query = QueryHelper.getFakePermawatchQuery(ACCOUNT_ID);
        const workItem = makeWorkItem(query, { id: 42 });
        Lists.push(ACCOUNT_ID, "permawatch", "", workItem.id, workItem.rev);

        render(<MenuHarness query={query} workItem={workItem} />);
        fireEvent.contextMenu(screen.getByTestId("row"));

        expect(screen.getByText(`${s("removeFromList")}"${s("permawatch")}"`)).toBeTruthy();
        expect(screen.queryByText(s("addToP"))).toBeNull();
        expect(screen.queryByText(s("addToF"))).toBeNull();
        expect(screen.queryByText(s("addToPinned"))).toBeNull();
        expect(screen.queryByText(s("addToD"))).toBeNull();
        expect(screen.queryByText(s("addToForwarded"))).toBeNull();
        expect(screen.queryByText(s("addToH"))).toBeNull();

        fireEvent.click(screen.getByText(`${s("removeFromList")}"${s("permawatch")}"`));

        expect(useSettingsStore.getState().lists.permawatch).toHaveLength(0);
    });

    it("names the list the item is in now, not the one cached on the instance", () => {
        //the instance in this block still remembers permawatch, the item has been moved to favorites
        const query = makeQuery(ACCOUNT_ID, "Collection2020");
        const workItem = makeWorkItem(query, { id: 42 });
        workItem._list = "permawatch";
        Lists.push(ACCOUNT_ID, "favorites", workItem._collectionName, workItem.id, workItem.rev);

        render(<MenuHarness query={query} workItem={workItem} />);
        fireEvent.contextMenu(screen.getByTestId("row"));

        expect(screen.getByText(`${s("removeFromList")}"${s("favorites")}"`)).toBeTruthy();
        expect(screen.getByText(s("addToP"))).toBeTruthy();
        expect(screen.queryByText(s("addToF"))).toBeNull();

        //and the removal acts on that list, not on the stale one
        fireEvent.click(screen.getByText(`${s("removeFromList")}"${s("favorites")}"`));

        expect(useSettingsStore.getState().lists.favorites).toHaveLength(0);
        expect(useSettingsStore.getState().lists.permawatch).toHaveLength(0);
    });
});
