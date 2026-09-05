import { useCallback, useEffect, useRef, useState } from "react";
import { getApi } from "../api/client";
import QueryHelper from "../helpers/Query";
import { Timers } from "../helpers/Timers";
import { Query } from "../models/query";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";

export function useQueryLoader(query: Query) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const refreshRate = useSettingsStore((state) => state.refreshRate);
    const setWorkItemsForQuery = useDataStore((state) => state.setWorkItemsForQuery);
    const [hiddenCount, setHiddenCount] = useState(0);

    const loadIdRef = useRef(0);

    const loadWorkItemsForThisQuery = useCallback(async () => {
        const loadId = ++loadIdRef.current;
        console.log("updating query ->", query.queryName, `(${query.queryId})`);
        try {
            const { workItems, hiddenCount } = await getApi(query.accountId).workItem.getByQuery(query);
            if (loadId !== loadIdRef.current) return;
            QueryHelper.calculateIconLevel(query, workItems);
            QueryHelper.toggleBoolean(query, "empty", !workItems.length);

            setWorkItemsForQuery(query, workItems);
            setHiddenCount(hiddenCount);

            setErrorMessage(null);
        } catch (e: any) {
            if (loadId !== loadIdRef.current) return;
            setErrorMessage(e.message);
        } finally {
            if (loadId === loadIdRef.current) setIsLoading(false);
        }
    }, [setWorkItemsForQuery, query.queryId, query.accountId]);

    const routineStart = useCallback(async () => {
        setIsLoading(true);

        Timers.delete(query.queryId);

        await loadWorkItemsForThisQuery();
        Timers.create(query.queryId, 1000 * refreshRate, () => {
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

    return { isLoading, routineStart, errorMessage, hiddenCount };
}
