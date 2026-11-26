import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

/**
 * Main-process log file, written next to the settings file.
 *
 * Windows sandbox failures kill the renderer before the app can report anything,
 * so the main process has to leave a breadcrumb that support can actually read.
 * Kept synchronous and best-effort: logging must never be the reason a startup
 * path fails.
 */
const MAX_LOG_BYTES = 1024 * 1024;

const userDataPath = app.getPath("userData");

let consoleLoggingInstalled = false;

export function getLogFilePath() {
    return path.join(userDataPath, "logs", "main.log");
}

function describe(value: unknown): string {
    if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
    if (typeof value === "string") return value;
    try {
        const json = JSON.stringify(value);
        return json === undefined ? String(value) : json;
    } catch (e) {
        return String(value);
    }
}

function rotateIfTooBig(filePath: string) {
    try {
        if (fs.statSync(filePath).size <= MAX_LOG_BYTES) return;
        fs.renameSync(filePath, filePath + ".old");
    } catch (e) {
        // missing file or a lock: appending will surface the real error, if any
    }
}

export function log(...args: unknown[]) {
    const filePath = getLogFilePath();

    try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        rotateIfTooBig(filePath);
        fs.appendFileSync(filePath, `${new Date().toISOString()} ${args.map(describe).join(" ")}\n`);
    } catch (e) {
        // deliberately ignored: no log file is better than a failed startup
    }
}

/**
 * Mirrors main-process console errors/warnings into the log file. Every existing
 * `console.error` in the main process becomes visible to support for free.
 */
export function installConsoleLogging() {
    if (consoleLoggingInstalled) return;
    consoleLoggingInstalled = true;

    for (const level of ["error", "warn"] as const) {
        const original = console[level].bind(console);
        console[level] = (...args: unknown[]) => {
            original(...args);
            log(`[${level}]`, ...args);
        };
    }
}
