import type { ISettingsStoreStatus } from "../../Platform";

const LS_KEY = "@settings";
/** Damaged raw value is moved here instead of being deleted. */
const LS_CORRUPT_KEY = "@settings.corrupt";

class WebStore {
    data: any = {};

    defaults: any = {
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
    };

    status: ISettingsStoreStatus = {
        ok: true,
        readOnly: false,
        recoveredFrom: null,
        corruptBackupPath: null,
    };

    constructor() {
        let json = "{}";

        try {
            json = localStorage.getItem(LS_KEY) || "{}";
        } catch (e) {
            // storage can be unavailable entirely (private mode, blocked cookies)
            console.error(`Failed to read ${LS_KEY}:`, e);
        }

        try {
            this.data = JSON.parse(json);
        } catch {
            console.warn(`safeParse: corrupt value for ${LS_KEY}, using defaults.`);

            // Keep the damaged value: it is the only chance to recover anything.
            try {
                localStorage.setItem(LS_CORRUPT_KEY, json);
                this.status.corruptBackupPath = LS_CORRUPT_KEY;
            } catch {
                // ignore eviction errors
            }

            try {
                localStorage.removeItem(LS_KEY);
            } catch {
                // ignore eviction errors
            }

            this.status.ok = false;
            this.data = {};
        }

        if (!this.data || typeof this.data !== "object" || Array.isArray(this.data)) {
            this.status.ok = false;
            this.data = {};
        }

        if (!this.data.installationID) {
            let iid = "";

            for (let i = 0; i < 6; i++) {
                if (i < 3) iid += String.fromCharCode(Math.random() * 26 + 65);
                else iid += String.fromCharCode(Math.random() * 10 + 48);
            }

            this.set("installationID", "FLW-" + iid);
        }
    }

    get<T>(key: string): T {
        if (this.data[key] === undefined) {
            return this.defaults[key] as T;
        }
        return this.data[key] as T;
    }

    getStatus(): ISettingsStoreStatus {
        return { ...this.status };
    }

    set<T>(key: string, val: T) {
        this.data[key] = val;

        // localStorage is all-or-nothing per key, and a quota error (or Safari
        // eviction) must not leave the in-memory state diverged or destroy what
        // is already stored.
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error(`Failed to persist ${LS_KEY}:`, e);
        }
    }
}

const webStore = new WebStore();

export default webStore;
