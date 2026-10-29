interface IAlignedGroup {
    callbacks: Map<number | string, () => void>;
    timeout: ReturnType<typeof setTimeout> | undefined;
    interval: ReturnType<typeof setInterval> | undefined;
}

export class Timers {
    private static storage: { [key: number | string]: NodeJS.Timeout | undefined } = {};
    private static alignedGroups = new Map<number, IAlignedGroup>();

    public static create(
        id: number | string,
        periodMs: number,
        callback: () => void,
        startImmediately: boolean = false
    ) {
        this.delete(id);
        if (startImmediately) callback();
        const ivl = setInterval(callback, periodMs);
        this.storage[id] = ivl;
        return ivl;
    }

    /**
     * Runs the callback on a shared periodMs grid instead of its own interval.
     *
     * Queries used to start their interval after their own first load, so the
     * refresh rounds drifted apart: at any moment some queries were a whole cycle
     * fresher than others, and the tray icon saw that half refreshed set. On a
     * shared grid every query reloads at the same moment.
     */
    public static createAligned(id: number | string, periodMs: number, callback: () => void) {
        this.delete(id);

        let group = this.alignedGroups.get(periodMs);
        if (!group) {
            group = { callbacks: new Map(), timeout: undefined, interval: undefined };
            this.alignedGroups.set(periodMs, group);
        }

        group.callbacks.set(id, callback);

        if (group.timeout === undefined && group.interval === undefined) {
            const untilNextTick = periodMs - (Date.now() % periodMs);
            group.timeout = setTimeout(() => {
                group.timeout = undefined;
                this.fireGroup(group);
                group.interval = setInterval(() => this.fireGroup(group), periodMs);
            }, untilNextTick);
        }
    }

    public static delete(id: number | string) {
        const ivl = this.storage[id];
        if (ivl) {
            clearInterval(ivl);
            this.storage[id] = undefined;
        }

        for (const [periodMs, group] of this.alignedGroups) {
            if (!group.callbacks.delete(id)) continue;

            if (!group.callbacks.size) {
                if (group.timeout !== undefined) clearTimeout(group.timeout);
                if (group.interval !== undefined) clearInterval(group.interval);
                this.alignedGroups.delete(periodMs);
            }
            break;
        }
    }

    private static fireGroup(group: IAlignedGroup) {
        [...group.callbacks.values()].forEach((callback) => {
            try {
                callback();
            } catch (e) {
                console.error("Aligned timer callback failed:", e);
            }
        });
    }
}
