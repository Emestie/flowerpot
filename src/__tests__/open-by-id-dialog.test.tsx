import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Platform from "../helpers/Platform";
import { useAppStore } from "../zustand/app";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import { OpenByIdDialog } from "../components/dialogs/OpenByIdDialog";
import {
    CLOUD_URL,
    ON_PREM_BASE,
    makeAccount,
    makeQuery,
    makeWorkItem,
    resetStores,
    stubMatchMedia,
} from "./test-utils";

beforeEach(() => {
    stubMatchMedia();
    resetStores();

    useSettingsStore
        .getState()
        .setAccounts([
            makeAccount(CLOUD_URL, "acc-cloud", "aad.me"),
            makeAccount("https://msktfs.eos.ru:8443/tfs/Collection2020/", "acc-onprem", "aad.me2"),
        ]);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function seedWorkItemWithTfsUrl() {
    const query = makeQuery("acc-onprem", "Collection2020");

    useDataStore.setState({
        workItems: [
            makeWorkItem(query, {
                htmlUrl: "https://msktfs.eos.ru:8443/tfs/Collection2020/MySweetBot/_apis/wit/workItems/5",
            }),
        ],
    });
}

describe("OpenByIdDialog", () => {
    it("opens a cloud deep link without a collection segment", () => {
        useSettingsStore.getState().setQueries([makeQuery("acc-cloud", "")]);
        seedWorkItemWithTfsUrl();

        const openUrl = vi.spyOn(Platform.current, "openUrl").mockImplementation(() => {});
        render(<OpenByIdDialog show />);

        //the collection selector auto-selects the first option on mount
        const idInput = document.querySelector(".af-input input")!;
        fireEvent.change(idInput, { target: { value: "5" } });
        fireEvent.click(screen.getByRole("button", { name: "OK" }));

        expect(openUrl).toHaveBeenCalledWith(CLOUD_URL + "_workitems/edit/5");
        expect(useAppStore.getState().dialogs["openById"]).toBe(false);
    });

    it("derives an on-premises deep link from the work item url", () => {
        //on-premises first so the selector auto-picks it
        useSettingsStore.getState().setQueries([makeQuery("acc-onprem", "Collection2020"), makeQuery("acc-cloud", "")]);
        seedWorkItemWithTfsUrl();

        const openUrl = vi.spyOn(Platform.current, "openUrl").mockImplementation(() => {});
        render(<OpenByIdDialog show />);

        const idInput = document.querySelector(".af-input input")!;
        fireEvent.change(idInput, { target: { value: "5" } });
        fireEvent.click(screen.getByRole("button", { name: "OK" }));

        expect(openUrl).toHaveBeenCalledWith(ON_PREM_BASE + "Collection2020/_workitems/edit/5");
    });

    it("does nothing without an id", () => {
        useSettingsStore.getState().setQueries([makeQuery("acc-cloud", "")]);

        const openUrl = vi.spyOn(Platform.current, "openUrl").mockImplementation(() => {});
        render(<OpenByIdDialog show />);

        fireEvent.click(screen.getByRole("button", { name: "OK" }));

        expect(openUrl).not.toHaveBeenCalled();
    });
});
