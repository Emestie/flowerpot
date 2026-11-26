import { app } from "electron";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { compatRecordMatches, isCompatModeSupportedOn, isCompatRecordActive } from "./compat-mode-policy";
import type { ICompatModeRecord } from "./compat-mode-policy";
import { getLogFilePath, log } from "./logger";

/**
 * Compatibility mode: after the renderer dies during startup with the Chromium
 * sandbox enabled, Flowerpot restarts itself with `--no-sandbox` so the user is
 * not locked out by an OS/security-software problem.
 *
 * The decision is remembered in `compat-mode.json` rather than in the shortcut
 * or the HKCU Run key: `registerAutostart()` rewrites the Run value on every
 * launch and an NSIS update relaunches the exe directly, so a flag placed there
 * would be lost. The record is bound to the app version and `os.release()`:
 * after an app or Windows update the sandbox is tried again, and if it works the
 * record is cleared automatically.
 */
export type { ICompatModeRecord } from "./compat-mode-policy";

export interface ICompatModeStatus {
    active: boolean;
    enabledAt?: number;
    reason?: string;
    exitCode?: number;
    logPath: string;
}

const userDataPath = app.getPath("userData");
const recordPath = path.join(userDataPath, "compat-mode.json");

/** The sandbox failure this works around is specific to Windows. */
function isCompatModeSupported() {
    return isCompatModeSupportedOn(process.platform);
}

function readRecord(): ICompatModeRecord | null {
    try {
        const raw = fs.readFileSync(recordPath, "utf8");
        const data = JSON.parse(raw);

        if (!data || typeof data !== "object" || Array.isArray(data)) return null;

        return {
            enabled: data.enabled === true,
            version: typeof data.version === "string" ? data.version : "",
            osRelease: typeof data.osRelease === "string" ? data.osRelease : "",
            enabledAt: typeof data.enabledAt === "number" ? data.enabledAt : 0,
            reason: typeof data.reason === "string" ? data.reason : undefined,
            exitCode: typeof data.exitCode === "number" ? data.exitCode : undefined,
        };
    } catch (e: any) {
        if (e && e.code !== "ENOENT") log("Failed to read compatibility mode record:", e);
        return null;
    }
}

function writeRecord(record: ICompatModeRecord | null) {
    try {
        if (record === null) {
            fs.rmSync(recordPath, { force: true });
            return;
        }

        fs.mkdirSync(path.dirname(recordPath), { recursive: true });
        fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
    } catch (e) {
        log("Failed to write compatibility mode record:", e);
    }
}

/** The failure was on this exact app version and Windows build. */
export function isCompatModeActiveForLaunch() {
    return isCompatModeSupported() && isCompatRecordActive(readRecord(), app.getVersion(), os.release());
}

export function enableCompatMode(reason: string | undefined, exitCode: number | undefined) {
    if (!isCompatModeSupported()) return;

    writeRecord({
        enabled: true,
        version: app.getVersion(),
        osRelease: os.release(),
        enabledAt: Date.now(),
        reason,
        exitCode,
    });
}

export function clearCompatMode() {
    writeRecord(null);
}

/**
 * Called on the first successful paint. A record left over from an older app
 * version or Windows build is dropped: the sandbox works again, so the next
 * launch should use it.
 */
export function markStartupSucceeded() {
    if (!isCompatModeSupported()) return;

    const record = readRecord();
    if (!record || !record.enabled) return;
    if (compatRecordMatches(record, app.getVersion(), os.release())) return;

    clearCompatMode();
    log(
        `Compatibility mode cleared: ${app.getVersion()} on ${os.release()} ` +
            `started with the Chromium sandbox (previous failure: ${record.version} on ${record.osRelease})`
    );
}

export function getCompatModeStatus(): ICompatModeStatus {
    if (!isCompatModeSupported()) {
        return { active: false, logPath: getLogFilePath() };
    }

    const record = readRecord();
    const active = isCompatRecordActive(record, app.getVersion(), os.release());

    return {
        active,
        enabledAt: record?.enabledAt,
        reason: record?.reason,
        exitCode: record?.exitCode,
        logPath: getLogFilePath(),
    };
}
