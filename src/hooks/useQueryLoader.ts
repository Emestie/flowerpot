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
    const [hiddenCount, setHiddenCount] = useState(0);

    const loadWorkItemsForThisQuery = useCallback(async () => {
        console.log("updating query ->", query.accountId, query.queryName, `(${query.queryId})`);
        try {
            const { workItems, hiddenCount } = await getApi(query.accountId).workItem.getByQuery(query);
            QueryHelper.calculateIconLevel(query, workItems);
            QueryHelper.toggleBoolean(query, "empty", !workItems.length);

            setWorkItemsForQuery(query, workItems);
            setHiddenCount(hiddenCount);

            setErrorMessage(null);
        } catch (e: any) {
            setErrorMessage(e.message);
        } finally {
            setIsLoading(false);
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
