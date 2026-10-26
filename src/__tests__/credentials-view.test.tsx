import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Telemetry from "../helpers/Telemetry";
import Loaders from "../helpers/Loaders";
import { s } from "../values/Strings";
import { useAppStore } from "../zustand/app";
import { useSettingsStore } from "../zustand/settings";
import { CredentialsView } from "../views/CredentialsView";
import { CLOUD_URL, resetStores, stubMatchMedia } from "./test-utils";

vi.mock("../helpers/Telemetry", () => ({
    default: {
        accountVerificationSucceed: vi.fn(),
    },
}));

vi.mock("../helpers/Loaders", () => ({
    default: {
        checkCredentials: vi.fn(async () => true),
        checkPermissions: vi.fn(async () => ({ ok: true })),
        getUserData: vi.fn(async () => ({ displayName: "Valery", descriptor: "aad.me" })),
    },
}));

const TOKEN = "t".repeat(50);

beforeEach(() => {
    stubMatchMedia();
    resetStores();
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

function fillForm(url: string) {
    const inputs = document.querySelectorAll("input");
    //the url input comes first, the token input second
    fireEvent.change(inputs[0], { target: { value: url } });
    fireEvent.change(inputs[1], { target: { value: TOKEN } });
    return screen.getByRole("button", { name: s("validate") });
}

describe("CredentialsView", () => {
    it("canonicalizes a cloud url on save", async () => {
        render(<CredentialsView />);

        const validateButton = fillForm("https://dev.azure.com/mstpwnz");
        expect(validateButton.disabled).toBe(false);

        fireEvent.click(validateButton);

        await waitFor(() => expect(Loaders.checkCredentials).toHaveBeenCalledWith(CLOUD_URL, TOKEN));
        await waitFor(() => expect(useSettingsStore.getState().accounts).toHaveLength(1));

        const saved = useSettingsStore.getState().accounts[0];
        expect(saved.url).toBe(CLOUD_URL);
        expect(saved.displayName).toBe("Valery");
        expect(saved.descriptor).toBe("aad.me");
        expect(Telemetry.accountVerificationSucceed).toHaveBeenCalledWith(saved.id);
        expect(useAppStore.getState().view).toBe("settings");
    });

    it("keeps a valid cloud url typed with the visualstudio.com host", async () => {
        render(<CredentialsView />);

        const validateButton = fillForm("https://mstpwnz.visualstudio.com/");

        expect(validateButton.disabled).toBe(false);
        fireEvent.click(validateButton);

        await waitFor(() => expect(useSettingsStore.getState().accounts).toHaveLength(1));
        expect(Loaders.checkCredentials).toHaveBeenCalledWith(CLOUD_URL, TOKEN);
    });

    it("disables validation for a url with a missing trailing slash on-premises", () => {
        render(<CredentialsView />);

        const validateButton = fillForm("https://msktfs.eos.ru:8443/tfs/Collection2020");

        expect(validateButton.disabled).toBe(true);
    });

    it("disables validation for a too-short token", () => {
        render(<CredentialsView />);

        const urlInput = document.querySelectorAll("input")[0];
        fireEvent.change(urlInput, { target: { value: CLOUD_URL } });
        const tokenInput = document.querySelectorAll("input")[1];
        fireEvent.change(tokenInput, { target: { value: "short" } });

        expect(screen.getByRole("button", { name: s("validate") }).disabled).toBe(true);
    });

    it("shows wrong credentials state when the check fails", async () => {
        vi.mocked(Loaders.checkCredentials).mockResolvedValueOnce(false);
        render(<CredentialsView />);

        const validateButton = fillForm(CLOUD_URL);
        fireEvent.click(validateButton);

        await waitFor(() => expect(screen.getByText(s("credsState4"))).toBeTruthy());
        expect(useSettingsStore.getState().accounts).toHaveLength(0);
    });
});
