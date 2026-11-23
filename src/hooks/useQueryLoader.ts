import { useCallback, useEffect, useRef, useState } from "react";
import { getApi } from "../api/client";
import { isPermawatchQuery, permawatchMembershipKey, syncPermawatchQuery } from "../helpers/permawatch";
import QueryHelper from "../helpers/Query";
import { Timers } from "../helpers/Timers";
import TrayIcon from "../helpers/TrayIcon";
import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";

export function useQueryLoader(query: Query) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const refreshRate = useSettingsStore((state) => state.refreshRate);
    const setWorkItemsForQuery = useDataStore((state) => state.setWorkItemsForQuery);
    const [hiddenCount, setHiddenCount] = useState(0);

    //the permawatch block is built from a settings list, not from a service query,
    //so it has to follow that list instead of the refresh timer alone
    const permawatchKey = useSettingsStore((state) =>
        isPermawatchQuery(query) ? permawatchMembershipKey(state.lists.permawatch, query.accountId) : ""
    );

    const loadIdRef = useRef(0);
    const permawatchKeyRef = useRef<string | null>(null);

    const loadWorkItemsForThisQuery = useCallback(async () => {
        const loadId = ++loadIdRef.current;
        console.log("updating query ->", query.queryName, `(${query.queryId})`);

        TrayIcon.markQueryLoading(query.queryId);

        let loadedWorkItems: WorkItem[] | undefined;

        try {
            const { workItems, hiddenCount } = await getApi(query.accountId).workItem.getByQuery(query);
            if (loadId !== loadIdRef.current) return;

            loadedWorkItems = workItems;

            QueryHelper.toggleBoolean(query, "empty", !workItems.length);

            setWorkItemsForQuery(query, workItems);
            setHiddenCount(hiddenCount);

            setErrorMessage(null);
        } catch (e: any) {
            if (loadId !== loadIdRef.current) return;
            setErrorMessage(e.message);
        } finally {
            //a superseded response is not worth showing, but its load must still end
            if (loadId === loadIdRef.current && loadedWorkItems) {
                TrayIcon.setQueryItems(query, loadedWorkItems);
            } else {
                TrayIcon.endQueryLoad(query.queryId);
            }

            if (loadId === loadIdRef.current) setIsLoading(false);
        }
    }, [setWorkItemsForQuery, query.queryId, query.accountId]);

    const routineStart = useCallback(async () => {
        setIsLoading(true);

        Timers.delete(query.queryId);

        await loadWorkItemsForThisQuery();
        Timers.createAligned(query.queryId, 1000 * refreshRate, () => {
            setIsLoading(true);
            loadWorkItemsForThisQuery();
        });
    }, [loadWorkItemsForThisQuery, refreshRate, query.queryId]);

    useEffect(() => {
        routineStart();
        return () => {
            Timers.delete(query.queryId);
        };
    }, [routineStart, query.queryId]);

    //adding an item to permawatch (or taking it out) must not remount the whole view:
    //the block syncs what is already loaded and then reloads itself
    useEffect(() => {
        if (!isPermawatchQuery(query)) return;

        if (permawatchKeyRef.current === null) {
            permawatchKeyRef.current = permawatchKey;
            //the first load is already on its way, but items another block holds can show right away
            syncPermawatchQuery(query);
            return;
        }

        if (permawatchKeyRef.current === permawatchKey) return;
        permawatchKeyRef.current = permawatchKey;

        syncPermawatchQuery(query);
        routineStart();
    }, [permawatchKey, query, routineStart]);

    return { isLoading, routineStart, errorMessage, hiddenCount };
}
