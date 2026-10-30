import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";
import Platform from "./Platform";

/** how long the tray waits after the last finished query before repainting */
const SETTLE_MS = 400;
/** a never finishing round must not freeze the icon forever */
const ROUND_TIMEOUT_MS = 15000;

//tray icon levels, see build-resources/icons
const LEVEL_GREY = 0; //no data yet: still loading, or no connection
const LEVEL_RED = 1; //a priority 1 item is present
const LEVEL_ITEMS = 3; //items are present
const LEVEL_EMPTY = 4; //nothing watched, or nothing to do

/**
 * Tray icon colour.
 *
 * Level 0 is only for "the app does not know yet" (start, connection problems).
 * Every other state comes from the work items of the queries that are actually
 * watched (enabled, without "ignore icon"): a query excluded from the icon must
 * not influence it at all, and when nothing is watched there is nothing to do, so
 * the icon is green.
 *
 * The level is never read from the persisted WIStorage snapshots: those exist for
 * the notification diffing only and keep the work items of disabled or removed
 * queries forever, which used to paint the icon red.
 *
 * The repaint is deferred until the refresh round has settled. Every finished
 * query used to repaint the tray with a half refreshed data set, so a priority 1
 * item that had just disappeared elsewhere still flashed the icon red for the
 * rest of the round.
 */
export default class TrayIcon {
    /** last known items per query id, current session only */
    private static itemsByQuery = new Map<string, WorkItem[]>();
    /** query id -> loads in flight, so a superseded load cannot end the round */
    private static loadsInFlight = new Map<string, number>();
    private static settleTimer: ReturnType<typeof setTimeout> | undefined;
    private static roundTimer: ReturnType<typeof setTimeout> | undefined;
    /** true as soon as any query delivered its items in this session */
    private static everLoaded = false;
    private static lastPublished: string | undefined;
    private static lastRelevantSignature: string | undefined;
    private static unsubscribe: (() => void) | undefined;

    public static init() {
        if (this.unsubscribe) return;

        this.lastRelevantSignature = undefined;
        this.unsubscribe = useSettingsStore.subscribe((state) => {
            const signature = this.getRelevantSignature(state.queries || [], state.iconChangesOnMyWorkItemsOnly);
            if (signature === this.lastRelevantSignature) return;
            this.lastRelevantSignature = signature;
            this.schedulePublish();
        });
    }

    /** A query started loading: the icon keeps its level until the round settles. */
    public static markQueryLoading(queryId: string) {
        this.loadsInFlight.set(queryId, (this.loadsInFlight.get(queryId) ?? 0) + 1);

        if (this.roundTimer === undefined) {
            this.roundTimer = setTimeout(() => this.publish(), ROUND_TIMEOUT_MS);
        }
        this.clearSettleTimer();
    }

    /** The query delivered its items; also ends its load. */
    public static setQueryItems(query: Query, items: WorkItem[]) {
        this.itemsByQuery.set(query.queryId, [...items]);
        this.everLoaded = true;
        this.endQueryLoad(query.queryId);
    }

    /** The query failed or its response was superseded; its last items are kept. */
    public static endQueryLoad(queryId: string) {
        const count = (this.loadsInFlight.get(queryId) ?? 0) - 1;
        if (count > 0) {
            this.loadsInFlight.set(queryId, count);
            return;
        }

        this.loadsInFlight.delete(queryId);
        this.schedulePublish();
    }

    /** Drops all state; used by tests and by a full tray rebuild. */
    public static reset() {
        this.clearTimers();
        this.itemsByQuery.clear();
        this.loadsInFlight.clear();
        this.everLoaded = false;
        this.lastPublished = undefined;
        this.lastRelevantSignature = undefined;
        this.unsubscribe?.();
        this.unsubscribe = undefined;
    }

    /**
     * Sets a level that does not come from the query data (error screen, debug
     * tools) and remembers it, so a later round whose level happens to match is
     * not swallowed by the "same state" check.
     */
    public static forceLevel(level: number, hasChanges: boolean = false) {
        this.clearTimers();

        this.lastPublished = level + (hasChanges ? "d" : "");
        Platform.current.updateTrayIcon(level, hasChanges);
    }

    private static schedulePublish() {
        if (this.loadsInFlight.size) return;

        this.clearSettleTimer();
        this.settleTimer = setTimeout(() => this.publish(), SETTLE_MS);
    }

    private static publish() {
        this.clearTimers();

        const { level, hasChanges } = this.computeState();
        const signature = level + (hasChanges ? "d" : "");
        if (signature === this.lastPublished) return;

        this.lastPublished = signature;
        Platform.current.updateTrayIcon(level, hasChanges);
    }

    private static computeState(): { level: number; hasChanges: boolean } {
        const settings = useSettingsStore.getState();
        const relevant = (settings.queries || []).filter((q) => q.enabled && !q.ignoreIcon);

        //nothing watched at all (every query disabled or "ignore icon"): all work is done
        if (!relevant.length) return { level: LEVEL_EMPTY, hasChanges: false };

        //no data yet: the grey icon stands for "still loading" or "no connection"
        if (!this.everLoaded) return { level: LEVEL_GREY, hasChanges: false };

        let items: WorkItem[] = [];
        relevant.forEach((q) => {
            const queryItems = this.itemsByQuery.get(q.queryId);
            if (queryItems) items = items.concat(queryItems);
        });

        if (settings.iconChangesOnMyWorkItemsOnly) items = items.filter((wi) => wi._isMine);

        const changesCollection = useDataStore.getState().changesCollection;
        const hasChanges = items.some((wi) => !!changesCollection[wi.id]);
        const level = items.some((wi) => wi.isRed) ? LEVEL_RED : items.length ? LEVEL_ITEMS : LEVEL_EMPTY;

        return { level, hasChanges };
    }

    private static getRelevantSignature(queries: Query[], mineOnly: boolean) {
        const ids = queries
            .filter((q) => q.enabled && !q.ignoreIcon)
            .map((q) => q.queryId)
            .sort();
        return `${mineOnly ? 1 : 0}:${ids.join(",")}`;
    }

    private static clearSettleTimer() {
        if (this.settleTimer === undefined) return;
        clearTimeout(this.settleTimer);
        this.settleTimer = undefined;
    }

    private static clearTimers() {
        this.clearSettleTimer();
        if (this.roundTimer === undefined) return;
        clearTimeout(this.roundTimer);
        this.roundTimer = undefined;
    }
}
