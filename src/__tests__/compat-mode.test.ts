import { describe, expect, it } from "vitest";
import {
    compatRecordMatches,
    isCompatModeSupportedOn,
    isCompatRecordActive,
} from "../../host/main/src/compat-mode-policy";
import type { ICompatModeRecord } from "../../host/main/src/compat-mode-policy";

const VERSION = "1.0.0";
const OS_RELEASE = "10.0.26200";

function makeRecord(overrides?: Partial<ICompatModeRecord>): ICompatModeRecord {
    return {
        enabled: true,
        version: VERSION,
        osRelease: OS_RELEASE,
        enabledAt: 1795713101503,
        reason: "renderer crashed",
        exitCode: -2147483645,
        ...overrides,
    };
}

describe("compatibility mode record", () => {
    it("is active for the app version and Windows build that failed", () => {
        expect(isCompatRecordActive(makeRecord(), VERSION, OS_RELEASE)).toBe(true);
    });

    it("is ignored when it was disabled", () => {
        expect(isCompatRecordActive(makeRecord({ enabled: false }), VERSION, OS_RELEASE)).toBe(false);
    });

    it("is ignored without a record", () => {
        expect(isCompatRecordActive(null, VERSION, OS_RELEASE)).toBe(false);
    });

    it("gets a fresh attempt after an app update", () => {
        expect(isCompatRecordActive(makeRecord(), "1.0.1", OS_RELEASE)).toBe(false);
        expect(compatRecordMatches(makeRecord(), "1.0.1", OS_RELEASE)).toBe(false);
    });

    it("gets a fresh attempt after a Windows update", () => {
        expect(isCompatRecordActive(makeRecord(), VERSION, "10.0.26200.9000")).toBe(false);
        expect(compatRecordMatches(makeRecord(), VERSION, "10.0.26200.9000")).toBe(false);
    });

    it("still matches on the same version and build", () => {
        expect(compatRecordMatches(makeRecord(), VERSION, OS_RELEASE)).toBe(true);
    });

    it("is only supported on Windows", () => {
        expect(isCompatModeSupportedOn("win32")).toBe(true);
        expect(isCompatModeSupportedOn("darwin")).toBe(false);
        expect(isCompatModeSupportedOn("linux")).toBe(false);
    });
});
