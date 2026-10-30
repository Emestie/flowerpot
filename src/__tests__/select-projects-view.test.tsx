import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { SelectProjectsView } from "../views/SelectProjectsView";
import { useSettingsStore } from "../zustand/settings";
import {
    CLOUD_URL,
    ON_PREM_URL,
    PROJECT_GUID,
    makeAccount,
    makeJsonResponse,
    resetStores,
    stubFetch,
    stubMatchMedia,
} from "./test-utils";

beforeEach(() => {
    stubMatchMedia();
    resetStores();
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("SelectProjectsView", () => {
    it("lists cloud projects without a collection prefix", async () => {
        useSettingsStore.getState().setAccounts([makeAccount(CLOUD_URL, "acc-cloud")]);

        const calls = stubFetch((url) =>
            url.includes("_api/_wit/teamProjects")
                ? makeJsonResponse({
                      projects: [
                          { guid: PROJECT_GUID, name: "MySweetBot" },
                          { guid: "61ac3325-b1d5-4460-8c8a-7c686d617c38", name: "any" },
                      ],
                  })
                : makeJsonResponse({ value: [] })
        );

        render(<SelectProjectsView />);

        await waitFor(() => expect(screen.getByText("MySweetBot")).toBeTruthy());
        expect(screen.getByText("any")).toBeTruthy();

        //cloud: the label is the bare project name, no leading "collection / "
        expect(screen.queryByText(" / MySweetBot")).toBeNull();
        expect(calls[1].url).toBe(CLOUD_URL + "_api/_wit/teamProjects?__v=5");
    });

    it("prefixes on-premises project labels with the collection name", async () => {
        useSettingsStore.getState().setAccounts([makeAccount(ON_PREM_URL, "acc-onprem")]);

        stubFetch((url) =>
            url.includes("_api/_wit/teamProjects")
                ? makeJsonResponse({ projects: [{ guid: PROJECT_GUID, name: "MySweetBot" }] })
                : makeJsonResponse({ value: [{ id: "c1", name: "Collection2020", url: "" }] })
        );

        render(<SelectProjectsView />);

        await waitFor(() => expect(screen.getByText("Collection2020 / MySweetBot")).toBeTruthy());
    });
});
