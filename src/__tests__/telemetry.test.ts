import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CyrillicToTranslit from "cyrillic-to-translit-js";

//preloadConnectionData would go through the API client; the payload only needs
//the collection (Account) display name it resolves to
vi.mock("../helpers/Connection", () => ({
    preloadConnectionData: vi.fn(async () => ({
        authenticatedUser: { properties: { Account: { $value: "MySweetBot" } } },
    })),
}));

import Telemetry from "../helpers/Telemetry";
import { useSettingsStore } from "../zustand/settings";
import { ON_PREM_URL, makeAccount, makeJsonResponse, resetStores, stubFetch } from "./test-utils";

const TELEMETRY_URL = "https://mysweetbot.netlify.app/.netlify/functions/handle-app-usage?data=";

interface IPayload {
    app: string;
    reason: string;
    name: string;
    ver: string;
    platform: number;
    os: string;
    iid: string;
    extraInfo: string;
}

/** The beacon encodes its body as base64 JSON in the `data` query parameter. */
function decodePayload(url: string): IPayload {
    return JSON.parse(atob(url.slice(TELEMETRY_URL.length)));
}

function telemetryCalls(calls: { url: string }[]) {
    return calls.filter((c) => c.url.startsWith(TELEMETRY_URL));
}

/** Body of the single beacon that was sent; fails loudly when there was none. */
function sentPayload(calls: { url: string }[]): IPayload {
    return decodePayload(telemetryCalls(calls)[0].url);
}

function cyrillicAccount() {
    return { ...makeAccount(ON_PREM_URL, "acc-1"), displayName: "Иван Петров" };
}

beforeEach(() => {
    resetStores();
    useSettingsStore.setState({ allowTelemetry: true, accounts: [] });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

/**
 * Transliteration used to ride in on `new CyrillicToTranslit()`; 3.2.x typings
 * only declare a factory, so Telemetry.ts line 9 calls it plainly. These tests
 * pin down that the shared instance still does the work the payloads rely on.
 */
describe("Telemetry transliteration", () => {
    it("is a factory whose instance transliterates Cyrillic to Latin", () => {
        const translit = CyrillicToTranslit();

        expect(typeof translit.transform).toBe("function");
        expect(translit.transform("Иван Петров")).toBe("Ivan Petrov");
        expect(translit.transform("Привет, мир!")).toBe("Privet, mir!");
    });

    it("produces the same output as the `new` form it replaced", () => {
        const called = CyrillicToTranslit();
        const constructed = new (CyrillicToTranslit as any)();

        for (const sample of ["Иван Петров", "Щука, ёжик!", "ҐґЄєІіЇї", "Hello World", "Привет мир 123 ABC"]) {
            expect(called.transform(sample)).toBe(constructed.transform(sample));
        }
    });

    it("sends the installed-version beacon with a transliterated account name", async () => {
        const calls = stubFetch(() => makeJsonResponse({}));
        useSettingsStore.setState({ accounts: [cyrillicAccount()] });

        Telemetry.versionUsageInfo();

        await vi.waitFor(() => expect(telemetryCalls(calls)).toHaveLength(1));
        const payload = sentPayload(calls);

        expect(payload.app).toBe("Flowerpot");
        expect(payload.reason).toBe("Version installed");
        expect(payload.name).toBe("Ivan Petrov / MySweetBot");
        //theme / colorScheme, straight from the settings store
        expect(payload.extraInfo).toBe("system/classic");
        expect(payload.os).toBeTruthy();
    });

    it("keeps Latin-only names readable", async () => {
        const calls = stubFetch(() => makeJsonResponse({}));
        useSettingsStore.setState({ accounts: [makeAccount(ON_PREM_URL, "acc-1")] });

        Telemetry.versionUsageInfo();

        await vi.waitFor(() => expect(telemetryCalls(calls)).toHaveLength(1));
        expect(sentPayload(calls).name).toBe("Test User / MySweetBot");
    });

    it("falls back to Unknown for an account that is not signed in", async () => {
        const calls = stubFetch(() => makeJsonResponse({}));

        Telemetry.accountVerificationSucceed("missing-account");

        await vi.waitFor(() => expect(telemetryCalls(calls)).toHaveLength(1));
        const payload = sentPayload(calls);

        expect(payload.reason).toBe("Account verified");
        expect(payload.name.startsWith("Unknown")).toBe(true);
    });

    it("transliterates feedback text and sends it even with telemetry disabled", async () => {
        const calls = stubFetch(() => makeJsonResponse({}));
        useSettingsStore.setState({ allowTelemetry: false });

        const sent = await Telemetry.sendFeedback("Привет, мир! Ёжик");

        expect(sent).toBe(true);
        const payload = sentPayload(calls);
        expect(payload.reason).toBe("Feedback");
        expect(payload.extraInfo).toBe("TRNSL:Privet, mir! Yozhik");
    });

    it("stays silent when telemetry is disabled", async () => {
        const calls = stubFetch(() => makeJsonResponse({}));
        useSettingsStore.setState({ allowTelemetry: false, accounts: [cyrillicAccount()] });

        Telemetry.versionUsageInfo();
        await Promise.resolve();

        expect(calls).toHaveLength(0);
    });
});
