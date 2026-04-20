import { useCallback, useEffect, useState } from "react";
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
    const queries = useSettingsStore((state) => state.queries);
    const [hiddenCount, setHiddenCount] = useState(0);

    const currentQuery = queries.find((q) => q.queryId === query.queryId) || query;

    const loadWorkItemsForThisQuery = useCallback(async () => {
        console.log("updating query ->", currentQuery.accountId, currentQuery.queryName, `(${currentQuery.queryId})`);
        try {
            const { workItems, hiddenCount } = await getApi(currentQuery.accountId).workItem.getByQuery(currentQuery);
            QueryHelper.calculateIconLevel(currentQuery, workItems);
            QueryHelper.toggleBoolean(currentQuery, "empty", !workItems.length);

            setWorkItemsForQuery(currentQuery, workItems);
            setHiddenCount(hiddenCount);

            setErrorMessage(null);
        } catch (e: any) {
            setErrorMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [setWorkItemsForQuery, currentQuery.queryId, currentQuery.accountId]);

    const routineStart = useCallback(async () => {
        setIsLoading(true);

        Timers.delete(currentQuery.queryId);

        await loadWorkItemsForThisQuery();
        Timers.create(currentQuery.queryId, 1000 * refreshRate, () => {
            setIsLoading(true);
            loadWorkItemsForThisQuery();
        });
    }, [loadWorkItemsForThisQuery, refreshRate, currentQuery.queryId]);

    useEffect(() => {
        routineStart();
        return () => {
            Timers.delete(currentQuery.queryId);
        };
    }, [routineStart, currentQuery.queryId]);

    return { isLoading, routineStart, errorMessage, hiddenCount };
}
