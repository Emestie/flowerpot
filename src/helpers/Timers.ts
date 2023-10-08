export class Timers {
    private static storage: { [key: number | string]: NodeJS.Timeout | undefined } = {};

    public static create(
        id: number | string,
        periodMs: number,
        callback: () => void,
        startImmediately: boolean = false
    ) {
        if (startImmediately) callback();
        const ivl = setInterval(callback, periodMs);
        this.storage[id] = ivl;
        return ivl;
    }

    public static delete(id: number | string) {
        const ivl = this.storage[id];
        if (ivl) {
            clearInterval(ivl);
            this.storage[id] = undefined;
        }
    }
}
