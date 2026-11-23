import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { IListItem } from "./Settings";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";

export const PERMAWATCH_QUERY_PREFIX = "___permawatch";

export const isPermawatchQuery = (query: Query) => query.queryId.startsWith(PERMAWATCH_QUERY_PREFIX);

const itemKey = (collection: string | undefined, id: number) => `${collection || ""}#${id}`;

/**
 * Stable (order independent) description of the permawatch membership of one account.
 * The permawatch block compares it between renders to learn that the list has changed.
 */
export function permawatchMembershipKey(items: IListItem[] | undefined, accountId: string) {
    return (items || [])
        .filter((x) => x.accountId === accountId)
        .map((x) => itemKey(x.collection, x.id))
        .sort()
        .join(",");
}

/**
 * Aligns the items already loaded for the permawatch block with the permawatch list, so a list
 * change is visible immediately instead of after a round trip: entries that left the list are
 * dropped, and entries that another query has already loaded are reused as they are.
 * The routine refresh that follows fills in the rest (ids that are not loaded anywhere yet and
 * fresh revisions).
 */
export function syncPermawatchQuery(query: Query) {
    const entries = (useSettingsStore.getState().lists.permawatch || []).filter((x) => x.accountId === query.accountId);

    const data = useDataStore.getState();
    const current = data.getWorkItemsForQuery(query);

    const wanted = new Set(entries.map((x) => itemKey(x.collection, x.id)));
    const kept = current.filter((wi) => wanted.has(itemKey(wi._collectionName, wi.id)));

    const present = new Set(kept.map((wi) => itemKey(wi._collectionName, wi.id)));
    const reused = entries
        .filter((x) => !present.has(itemKey(x.collection, x.id)))
        .map((entry) => {
            const source = data.workItems.find(
                (wi) =>
                    wi.id === entry.id &&
                    wi._queryId !== query.queryId &&
                    (wi._collectionName || "") === (entry.collection || "")
            );
            if (!source) return undefined;

            //another query owns the instance, the permawatch block needs its own
            return {
                ...source,
                _queryId: query.queryId,
                _collectionName: entry.collection || "",
                _list: "permawatch",
            } as WorkItem;
        })
        .filter((x): x is WorkItem => !!x);

    //nothing to add and nothing to drop: leave the store alone so no block re-renders
    if (kept.length === current.length && !reused.length) return;

    data.setWorkItemsForQuery(query, [...kept, ...reused]);
}
