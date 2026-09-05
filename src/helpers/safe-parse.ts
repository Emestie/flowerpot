export function safeParse<T>(raw: string | null | undefined, fallback: T, storageKey?: string): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        console.warn(`safeParse: corrupt value for ${storageKey ?? "unknown key"}, using fallback.`);
        try {
            if (storageKey) localStorage.removeItem(storageKey);
        } catch {
            // ignore eviction errors (e.g. storage unavailable)
        }
        return fallback;
    }
}
