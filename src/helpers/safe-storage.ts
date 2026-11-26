/**
 * Best-effort localStorage writes.
 *
 * The web build keeps settings, query/PR snapshots and change collections in
 * localStorage, which has a shared ~5 MB quota. When it fills up, setItem
 * throws QuotaExceededError and that used to bubble out of the loaders and
 * show up as a red error banner on the work items / pull requests block.
 *
 * Losing a snapshot is harmless (it only means a notification can repeat), so
 * storage failures are logged and swallowed instead.
 */
export function persistToLocalStorage(key: string, value: unknown): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn(`Failed to persist ${key} to localStorage, keeping in-memory state only.`, e);
        return false;
    }
}
