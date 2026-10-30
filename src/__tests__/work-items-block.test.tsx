import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Platform from "../helpers/Platform";
import { s } from "../values/Strings";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import { WorkItemsBlock } from "../components/work-items/WorkItemsBlock";
import {
    CLOUD_URL,
    ON_PREM_URL,
    QUERY_ID,
    makeAccount,
    makeQuery,
    makeWorkItem,
    resetStores,
    stubMatchMedia,
} from "./test-utils";
import type { Query } from "../models/query";

vi.mock("../hooks/useQueryLoader", () => ({
    useQueryLoader: () => ({
        isLoading: false,
        routineStart: vi.fn(),
        errorMessage: undefined,
        hiddenCount: 0,
    }),
}));

vi.mock("../components/work-items/use-filtered-work-items", () => ({
    useFilteredWorkItems: (query: Query) =>
        useDataStore.getState().workItems.filter((wi) => wi._queryId === query.queryId),
}));

vi.mock("../components/work-items/WorkItemRow", () => ({
    WorkItemRow: () => (
        <tr data-testid="wi-row">
            <td>work item row</td>
        </tr>
    ),
}));

beforeEach(() => {
    stubMatchMedia();
    resetStores();
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("WorkItemsBlock — deep links", () => {
    it("opens a cloud query by id in the browser", async () => {
        useSettingsStore.getState().setAccounts([makeAccount(CLOUD_URL, "acc-cloud")]);
        const query = makeQuery("acc-cloud", "");
        useDataStore.setState({ workItems: [makeWorkItem(query)] });

        const openUrl = vi.spyOn(Platform.current, "openUrl").mockImplementation(() => {});
        render(<WorkItemsBlock query={query} />);

        fireEvent.click(screen.getByTitle(s("openExternal")));

        expect(openUrl).toHaveBeenCalledWith(`${CLOUD_URL}MySweetBot/_queries/query/${QUERY_ID}`);
    });

    it("opens an on-premises query via the work items hub path", async () => {
        useSettingsStore.getState().setAccounts([makeAccount(ON_PREM_URL, "acc-onprem")]);
        const query = makeQuery("acc-onprem", "Collection2020");
        useDataStore.setState({ workItems: [makeWorkItem(query)] });

        const openUrl = vi.spyOn(Platform.current, "openUrl").mockImplementation(() => {});
        render(<WorkItemsBlock query={query} />);

        fireEvent.click(screen.getByTitle(s("openExternal")));

        expect(openUrl).toHaveBeenCalledWith(
            `${ON_PREM_URL}Collection2020/MySweetBot/_workItems?path=Shared%20Queries%2FAssigned%20to%20me&_a=query`
        );
    });

    it("renders the work item rows", () => {
        useSettingsStore.getState().setAccounts([makeAccount(CLOUD_URL, "acc-cloud")]);
        const query = makeQuery("acc-cloud", "");
        useDataStore.setState({ workItems: [makeWorkItem(query, { id: 1 }), makeWorkItem(query, { id: 2 })] });

        render(<WorkItemsBlock query={query} />);

        expect(screen.getAllByTestId("wi-row")).toHaveLength(2);
    });
});
