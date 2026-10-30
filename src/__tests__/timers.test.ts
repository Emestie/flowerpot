import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Timers } from "../helpers/Timers";

const createdIds: Array<number | string> = [];

function createAligned(id: number | string, periodMs: number, callback: () => void) {
    createdIds.push(id);
    Timers.createAligned(id, periodMs, callback);
}

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    //the fake timers are thrown away below, so the group must go first
    createdIds.splice(0).forEach((id) => Timers.delete(id));
    vi.useRealTimers();
});

describe("Timers.createAligned", () => {
    it("fires every callback on the same grid, not its own interval", async () => {
        vi.setSystemTime(new Date("2026-01-01T10:00:03Z"));

        const first = vi.fn();
        const second = vi.fn();

        createAligned("first", 10000, first);
        createAligned("second", 10000, second);

        expect(first).not.toHaveBeenCalled();

        //next grid boundary is 10:00:10
        await vi.advanceTimersByTimeAsync(6999);
        expect(first).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
    });

    it("keeps ticking and stops when the last callback is deleted", async () => {
        vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));

        const first = vi.fn();
        const second = vi.fn();

        createAligned("first", 10000, first);
        createAligned("second", 10000, second);

        await vi.advanceTimersByTimeAsync(20000);
        expect(first).toHaveBeenCalledTimes(2);
        expect(second).toHaveBeenCalledTimes(2);

        Timers.delete("first");
        Timers.delete("second");
        createdIds.length = 0;

        await vi.advanceTimersByTimeAsync(20000);
        expect(first).toHaveBeenCalledTimes(2);
        expect(second).toHaveBeenCalledTimes(2);
    });

    it("re-registering an id does not duplicate it", async () => {
        vi.setSystemTime(new Date("2026-01-01T10:00:00Z"));

        const stale = vi.fn();
        const fresh = vi.fn();

        createAligned("query", 10000, stale);
        createAligned("query", 10000, fresh);

        await vi.advanceTimersByTimeAsync(10000);

        expect(stale).not.toHaveBeenCalled();
        expect(fresh).toHaveBeenCalledTimes(1);
    });
});
