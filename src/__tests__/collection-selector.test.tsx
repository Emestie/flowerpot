import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CollectionSelector } from "../components/CollectionSelector";
import { QueriesSettingsTable } from "../components/tables/QueriesSettingsTable";
import { ProjectsSettingsTable } from "../components/tables/ProjectsSettingsTable";
import { Project } from "../models/project";
import { useSettingsStore } from "../zustand/settings";
import {
    CLOUD_URL,
    ON_PREM_URL,
    PROJECT_GUID,
    PROJECT_NAME,
    makeAccount,
    makeQuery,
    resetStores,
    stubMatchMedia,
} from "./test-utils";

beforeEach(() => {
    stubMatchMedia();
    resetStores();

    useSettingsStore
        .getState()
        .setAccounts([makeAccount(CLOUD_URL, "acc-cloud"), makeAccount(ON_PREM_URL, "acc-onprem")]);
    useSettingsStore
        .getState()
        .setQueries([
            makeQuery("acc-cloud", ""),
            makeQuery("acc-onprem", "Collection2020", { queryName: "Team queries" }),
        ]);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe("CollectionSelector", () => {
    it("auto-selects the first collection and reports its (possibly empty) name", () => {
        const onChange = vi.fn();
        render(<CollectionSelector onChange={onChange} />);

        expect(onChange).toHaveBeenCalledWith({ accountId: "acc-cloud", collectionName: "" });
    });

    it("shows the org name as the display name for cloud collections", () => {
        render(<CollectionSelector onChange={vi.fn()} />);

        //the selected option label contains the org fallback
        expect(document.body.textContent).toContain("mstpwnz");
    });

    it("switches to the on-premises collection with its real name", () => {
        const onChange = vi.fn();
        render(<CollectionSelector onChange={onChange} />);

        //open the dropdown and pick the second option
        fireEvent.click(screen.getByRole("button"));
        const options = screen.getAllByRole("option");
        expect(options).toHaveLength(2);
        fireEvent.click(options[1]);

        expect(onChange).toHaveBeenCalledWith({ accountId: "acc-onprem", collectionName: "Collection2020" });
    });
});

describe("QueriesSettingsTable", () => {
    it("shows the org name for cloud rows and the real collection for on-premises rows", () => {
        render(<QueriesSettingsTable />);

        expect(screen.getByText("mstpwnz")).toBeTruthy();
        expect(screen.getByText("Collection2020")).toBeTruthy();
        //team name column: both seeded queries live in MySweetBot
        expect(screen.getAllByText("MySweetBot")).toHaveLength(2);
        expect(screen.getByText("Team queries")).toBeTruthy();
    });
});

describe("ProjectsSettingsTable", () => {
    it("shows the org name for cloud projects and the real collection on-premises", () => {
        useSettingsStore
            .getState()
            .setProjects([
                new Project("acc-cloud", { guid: PROJECT_GUID, name: PROJECT_NAME }, ""),
                new Project("acc-onprem", { guid: PROJECT_GUID, name: PROJECT_NAME }, "Collection2020"),
            ]);

        render(<ProjectsSettingsTable />);

        expect(screen.getByText("mstpwnz")).toBeTruthy();
        expect(screen.getByText("Collection2020")).toBeTruthy();
        //both project rows render
        expect(screen.getAllByText(PROJECT_NAME)).toHaveLength(2);
    });
});
