import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// store.ts reads app.getPath("userData") at import time; the class itself takes
// an explicit directory, so the mock only has to keep the singleton importable.
vi.mock("electron", () => ({
    app: { getPath: () => os.tmpdir() },
}));

import { Store } from "../../host/main/src/store";

const DEFAULTS = {
    windowDim: { width: 800, height: 600 },
    windowPos: { x: undefined, y: undefined },
    autostart: true,
    locale: "en",
    flowerpot: undefined,
};

let dir: string;
let settingsPath: string;

function makeStore() {
    return new Store({ configName: "settings", defaults: DEFAULTS }, dir);
}

function readFile() {
    return fs.readFileSync(settingsPath, "utf8");
}

function readJson() {
    return JSON.parse(readFile());
}

/** The exact shape written by the version that is already in production. */
const PRODUCTION_FILE = {
    windowDim: { width: 1200, height: 900 },
    windowPos: { x: 40, y: 20 },
    autostart: false,
    locale: "ru",
    installationID: "FLW-ABC123",
    flowerpot: JSON.stringify({ accounts: [{ id: "a1", url: "https://example.com" }], refreshRate: 60 }),
};

beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "flowerpot-settings-"));
    settingsPath = path.join(dir, "settings.json");
});

afterEach(() => {
    vi.useRealTimers();
    fs.rmSync(dir, { recursive: true, force: true });
});

describe("Store: reading an existing production file", () => {
    it("keeps the current file shape untouched", () => {
        fs.writeFileSync(settingsPath, JSON.stringify(PRODUCTION_FILE));

        const store = makeStore();

        expect(store.get("installationID")).toBe("FLW-ABC123");
        expect(store.get("locale")).toBe("ru");
        expect(store.get("autostart")).toBe(false);
        expect(store.get("flowerpot")).toBe(PRODUCTION_FILE.flowerpot);
        expect(store.getStatus()).toEqual({
            ok: true,
            readOnly: false,
            recoveredFrom: null,
            corruptBackupPath: null,
        });

        // nothing changed, so nothing should have been rewritten
        store.flushSync();
        expect(readJson()).toEqual(PRODUCTION_FILE);
    });

    it("tolerates a file with missing keys", () => {
        fs.writeFileSync(settingsPath, JSON.stringify({ installationID: "FLW-OLD001" }));

        const store = makeStore();

        expect(store.get("installationID")).toBe("FLW-OLD001");
        expect(store.get("locale")).toBe("en");
        expect(store.get("autostart")).toBe(true);
    });

    it("accepts a UTF-8 BOM", () => {
        fs.writeFileSync(settingsPath, "\uFEFF" + JSON.stringify(PRODUCTION_FILE));

        const store = makeStore();

        expect(store.get("installationID")).toBe("FLW-ABC123");
        expect(store.getStatus().ok).toBe(true);
    });
});

describe("Store: a damaged settings file", () => {
    it("restores from the backup copy and keeps the damaged file", () => {
        fs.writeFileSync(settingsPath, '{"installationID":"FLW-ABC1'); // truncated write
        fs.writeFileSync(path.join(dir, "settings.json.bak"), JSON.stringify(PRODUCTION_FILE));

        const store = makeStore();
        const status = store.getStatus();

        expect(status.ok).toBe(false);
        expect(status.recoveredFrom).toBe("backup");
        expect(status.readOnly).toBe(false);
        expect(store.get("installationID")).toBe("FLW-ABC123");

        expect(status.corruptBackupPath).toBeTruthy();
        expect(fs.readFileSync(status.corruptBackupPath!, "utf8")).toBe('{"installationID":"FLW-ABC1');

        // the recovered settings are written back in one piece
        store.flushSync();
        expect(readJson().installationID).toBe("FLW-ABC123");
    });

    it("recovers from a leftover temp file when the real one is empty", () => {
        fs.writeFileSync(settingsPath, "");
        fs.writeFileSync(path.join(dir, "settings.json.tmp"), JSON.stringify(PRODUCTION_FILE));

        const store = makeStore();

        expect(store.getStatus().recoveredFrom).toBe("temp");
        expect(store.get("installationID")).toBe("FLW-ABC123");
    });

    it("restores the real file from a leftover temp file when it is missing", () => {
        fs.writeFileSync(path.join(dir, "settings.json.tmp"), JSON.stringify(PRODUCTION_FILE));

        const store = makeStore();

        expect(store.getStatus().recoveredFrom).toBe("temp");
        expect(store.get("installationID")).toBe("FLW-ABC123");
        // the recovered content is moved into place, not recovered again next time
        expect(readJson()).toEqual(PRODUCTION_FILE);
    });

    it("starts fresh from damaged content, keeping a copy of it", () => {
        const garbage = '{"windowDim": {"width": 1200,';
        fs.writeFileSync(settingsPath, garbage);

        const store = makeStore();
        const status = store.getStatus();

        expect(status.ok).toBe(false);
        expect(status.readOnly).toBe(false);
        expect(status.recoveredFrom).toBeNull();
        expect(status.corruptBackupPath).toBeTruthy();
        expect(fs.readFileSync(status.corruptBackupPath!, "utf8")).toBe(garbage);

        // a usable file is in place right away, so new settings are still saved
        store.set("locale", "be");
        store.flushSync();

        expect(readJson().locale).toBe("be");
    });

    it("leaves a file it could not read at all untouched", () => {
        // a directory makes reading fail with an OS error rather than bad content
        fs.mkdirSync(settingsPath);

        const store = makeStore();
        const status = store.getStatus();

        expect(status.ok).toBe(false);
        expect(status.readOnly).toBe(true);
        expect(status.corruptBackupPath).toBeNull();

        store.set("locale", "ru");
        store.flushSync();

        expect(fs.statSync(settingsPath).isDirectory()).toBe(true);
        expect(fs.readdirSync(settingsPath)).toHaveLength(0);
    });

    it("does not pile up a copy of the same damaged file on every launch", () => {
        fs.writeFileSync(settingsPath, "not json at all");

        makeStore();
        makeStore();
        makeStore();

        const copies = fs.readdirSync(dir).filter((name) => name.includes(".corrupt-"));
        expect(copies).toHaveLength(1);
    });
});

describe("Store: writing", () => {
    it("writes atomically through a temp file and keeps a backup", () => {
        const store = makeStore();
        store.set("locale", "ru");
        store.flushSync();

        const first = readJson();
        expect(first.locale).toBe("ru");
        expect(first.installationID).toBeTruthy();
        expect(fs.existsSync(path.join(dir, "settings.json.tmp"))).toBe(false);

        store.set("locale", "be");
        store.flushSync();

        expect(readJson().locale).toBe("be");
        // the previous, still valid content is available for recovery
        expect(JSON.parse(fs.readFileSync(path.join(dir, "settings.json.bak"), "utf8")).locale).toBe("ru");
    });

    it("coalesces a burst of changes into one write", () => {
        vi.useFakeTimers();

        const store = makeStore();

        store.set("locale", "ru");
        store.set("locale", "be");
        store.set("autostart", false);

        // nothing reaches the disk while the burst is still going
        expect(fs.existsSync(settingsPath)).toBe(false);

        vi.advanceTimersByTime(250);

        expect(readJson()).toMatchObject({ locale: "be", autostart: false });
        expect(fs.existsSync(path.join(dir, "settings.json.tmp"))).toBe(false);
    });

    it("keeps the previous file intact when the write fails", () => {
        fs.writeFileSync(settingsPath, JSON.stringify(PRODUCTION_FILE));

        vi.useFakeTimers();

        const store = makeStore();

        // a directory in place of the temp file makes the write fail (EISDIR)
        fs.mkdirSync(path.join(dir, "settings.json.tmp"));

        store.set("locale", "be");
        vi.advanceTimersByTime(250);

        expect(readJson()).toEqual(PRODUCTION_FILE);

        fs.rmdirSync(path.join(dir, "settings.json.tmp"));
        store.flushSync();

        expect(readJson().locale).toBe("be");
    });
});
