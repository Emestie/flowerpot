import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

const userDataPath = app.getPath("userData");

const storeDefaults = {
    configName: "settings",
    defaults: {
        windowDim: {
            width: 800,
            height: 600,
        },
        windowPos: {
            x: undefined,
            y: undefined,
        },
        autostart: true,
        locale: "en",
        flowerpot: undefined,
    },
};

/**
 * A burst of set() calls is coalesced for this long before the file is touched.
 * Every settings change used to start its own writeFile, which let two whole-file
 * writes overlap and truncate each other.
 */
const WRITE_DEBOUNCE_MS = 200;

/**
 * Failures (EBUSY/EPERM from an antivirus or a cloud-sync handle, a read-only
 * folder, a full disk) are retried a few times, then left for the next change.
 */
const MAX_WRITE_ATTEMPTS = 5;

interface IJsonReadResult {
    ok: boolean;
    /** false only when the file does not exist at all (ENOENT) */
    exists: boolean;
    raw?: string;
    data?: any;
    reason?: string;
}

interface IStoreStatus {
    ok: boolean;
    readOnly: boolean;
    recoveredFrom: "backup" | "temp" | null;
    corruptBackupPath: string | null;
}

/**
 * Reads and parses a JSON file, telling "not there" apart from "there but
 * unreadable". The old code conflated both and returned defaults, which then
 * got written back over the user's real settings.
 */
function readJsonFile(filePath: string): IJsonReadResult {
    let raw: string;

    try {
        raw = fs.readFileSync(filePath, "utf8");
    } catch (e: any) {
        if (e && e.code === "ENOENT") return { ok: false, exists: false, reason: "missing" };
        return { ok: false, exists: true, reason: (e && e.code) || String(e) };
    }

    if (!raw.trim()) return { ok: false, exists: true, reason: "empty" };

    let data: any;
    try {
        // A UTF-8 BOM (PowerShell 5.1, several editors) makes JSON.parse throw.
        data = JSON.parse(raw.replace(/^\uFEFF/, ""));
    } catch (e: any) {
        return { ok: false, exists: true, reason: "invalid-json" };
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return { ok: false, exists: true, reason: "not-an-object" };
    }

    return { ok: true, exists: true, raw, data };
}

function cloneDefaults(defaults: any) {
    return JSON.parse(JSON.stringify(defaults));
}

/**
 * True when the file was read but its contents are unusable. That is a broken
 * file, not a passing read error: retrying later will not help, and replacing it
 * is safe once a copy is kept.
 */
function isDamagedContent(reason?: string) {
    return reason === "empty" || reason === "invalid-json" || reason === "not-an-object";
}

export class Store {
    private path: string;
    private tmpPath: string;
    private bakPath: string;
    private defaults: any;
    private data: any;
    private status: IStoreStatus;
    private writeTimer: ReturnType<typeof setTimeout> | null = null;
    private writeAttempts = 0;
    /** Last content known to be valid JSON on disk; rotated into .bak before each write. */
    private lastGoodContent: string | null = null;
    private warnedReadOnly = false;

    constructor(opts: any, userDataPath: string) {
        this.path = path.join(userDataPath, opts.configName + ".json");
        this.tmpPath = this.path + ".tmp";
        this.bakPath = this.path + ".bak";
        this.defaults = opts.defaults;
        this.status = { ok: true, readOnly: false, recoveredFrom: null, corruptBackupPath: null };

        this.data = this.load();

        if (!this.data.installationID) {
            let iid = "";

            for (let i = 0; i < 6; i++) {
                if (i < 3) iid += String.fromCharCode(Math.random() * 26 + 65);
                else iid += String.fromCharCode(Math.random() * 10 + 48);
            }

            this.set("installationID", "FLW-" + iid);
        }

        // A recovered or replaced file is written back right away, so the next
        // launch starts from a valid file instead of repeating the recovery.
        if (this.status.recoveredFrom !== null || (!this.status.ok && !this.status.readOnly)) {
            this.flushSync();
        }
    }

    /**
     * Loads the settings file without ever treating "unreadable" as "empty".
     * A damaged file is copied aside and, if possible, replaced in memory by the
     * backup copy; when nothing can be recovered the store turns read-only so
     * the user's file survives and can still be repaired by hand.
     */
    private load() {
        const primary = readJsonFile(this.path);

        if (primary.ok) {
            this.lastGoodContent = primary.raw!;
            return primary.data;
        }

        if (!primary.exists) {
            // Fresh install, or a previous run died between writing the temp
            // file and renaming it into place.
            const tmp = readJsonFile(this.tmpPath);
            if (tmp.ok) {
                this.status.recoveredFrom = "temp";
                this.lastGoodContent = null;
                return tmp.data;
            }
            return cloneDefaults(this.defaults);
        }

        this.status.ok = false;
        this.status.corruptBackupPath = this.quarantine();

        const backup = readJsonFile(this.bakPath);
        if (backup.ok) {
            console.error(`Settings file is unreadable (${primary.reason}), restored from ${this.bakPath}`);
            this.status.recoveredFrom = "backup";
            // null instead of the recovered content: the damaged file must not be
            // rotated into .bak, it is already kept aside as settings.corrupt-*.json
            this.lastGoodContent = null;
            return backup.data;
        }

        const tmp = readJsonFile(this.tmpPath);
        if (tmp.ok) {
            console.error(`Settings file is unreadable (${primary.reason}), restored from ${this.tmpPath}`);
            this.status.recoveredFrom = "temp";
            this.lastGoodContent = null;
            return tmp.data;
        }

        // Nothing could be restored. Damaged content (we read the bytes, they are
        // not valid settings) is safe to replace once a copy is kept; anything
        // else is a read error — a lock, permissions — and may well be fine on
        // the next launch, so the file is left alone and nothing is written.
        if (isDamagedContent(primary.reason) && this.status.corruptBackupPath !== null) {
            console.error(
                `Settings file is damaged (${primary.reason}). Starting with defaults; ` +
                    `the damaged file is kept as ${this.status.corruptBackupPath}`
            );
            return cloneDefaults(this.defaults);
        }

        console.error(
            `Settings file could not be read (${primary.reason}) and no backup could be restored. ` +
                `Starting with defaults and leaving ${this.path} untouched.`
        );
        this.status.readOnly = true;
        return cloneDefaults(this.defaults);
    }

    /**
     * Copies the damaged file next to the original so it can be inspected or
     * repaired later. Skipped when an identical-size copy is already there, so a
     * permanently damaged file does not pile up one copy per launch.
     */
    private quarantine(): string | null {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const dest = this.path.replace(/\.json$/i, "") + `.corrupt-${stamp}.json`;

        try {
            const size = fs.statSync(this.path).size;
            const dir = path.dirname(this.path);
            const prefix = path.basename(this.path).replace(/\.json$/i, "") + ".corrupt-";

            const alreadyKept = fs
                .readdirSync(dir)
                .some((name: string) => {
                    if (!name.startsWith(prefix)) return false;
                    try {
                        return fs.statSync(path.join(dir, name)).size === size;
                    } catch (e) {
                        return false;
                    }
                });

            if (alreadyKept) return null;

            fs.copyFileSync(this.path, dest);
            console.error(`Unreadable settings file copied to ${dest}`);
            return dest;
        } catch (e) {
            console.error("Failed to keep a copy of the unreadable settings file:", e);
            return null;
        }
    }

    get(key: string) {
        if (this.data[key] === undefined) {
            return this.defaults[key];
        }
        return this.data[key];
    }

    getStatus(): IStoreStatus {
        return { ...this.status };
    }

    /** Path of the live settings file, for revealing it to the user. */
    getFilePath() {
        return this.path;
    }

    /** Path of the copy kept from an unreadable settings file, when there is one. */
    getCorruptFilePath() {
        return this.status.corruptBackupPath;
    }

    set(key: string, val: any, dontWriteToFile?: boolean) {
        this.data[key] = val;
        if (dontWriteToFile) return;
        this.scheduleWrite();
    }

    private scheduleWrite() {
        if (this.status.readOnly) {
            if (!this.warnedReadOnly) {
                this.warnedReadOnly = true;
                console.error("Settings store is read-only: the unreadable settings file was left untouched.");
            }
            return;
        }

        if (this.writeTimer) clearTimeout(this.writeTimer);
        this.writeAttempts = 0;

        this.writeTimer = setTimeout(() => {
            this.writeTimer = null;
            this.flush();
        }, WRITE_DEBOUNCE_MS);
    }

    /**
     * Writes the whole store atomically: temp file first, then a rename over the
     * real one. Nothing is ever truncated in place, so an interrupted write
     * leaves the previous settings intact. Also synchronous, so two writes can
     * never interleave.
     */
    flush() {
        if (this.status.readOnly) return;

        let content: string;
        try {
            content = JSON.stringify(this.data);
        } catch (e) {
            console.error("Failed to serialize settings:", e);
            return;
        }

        if (content === this.lastGoodContent) return;

        try {
            if (this.lastGoodContent !== null) {
                try {
                    fs.writeFileSync(this.bakPath, this.lastGoodContent);
                } catch (e) {
                    // a missing backup must never block saving the settings themselves
                }
            }

            fs.writeFileSync(this.tmpPath, content);
            fs.renameSync(this.tmpPath, this.path);

            this.lastGoodContent = content;
            this.writeAttempts = 0;
        } catch (e) {
            this.writeAttempts++;
            console.error(`Failed to write settings file (attempt ${this.writeAttempts}):`, e);

            if (this.writeAttempts >= MAX_WRITE_ATTEMPTS) return;

            if (this.writeTimer) clearTimeout(this.writeTimer);
            this.writeTimer = setTimeout(() => {
                this.writeTimer = null;
                this.flush();
            }, this.writeAttempts * 250);
        }
    }

    /** Writes anything still pending, for app quit and update restarts. */
    flushSync() {
        if (this.writeTimer) {
            clearTimeout(this.writeTimer);
            this.writeTimer = null;
        }
        this.writeAttempts = 0;
        this.flush();
    }
}

export const store = new Store(storeDefaults, userDataPath);
