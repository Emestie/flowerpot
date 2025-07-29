import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getApi } from "../api/client";
import Query from "../helpers/Query";
import { Timers } from "../helpers/Timers";
import { IQuery } from "../modules/api-client";
import { dataWorkItemsForQuerySet } from "../redux/actions/dataActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

export function useQueryLoader(query: IQuery) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const dispatch = useDispatch();
    const { refreshRate } = useSelector(settingsSelector);
    const [hiddenCount, setHiddenCount] = useState(0);

    const loadWorkItemsForThisQuery = useCallback(async () => {
        console.log("updating query ->", query.accountId, query.queryName, `(${query.queryId})`);
        try {
            const { workItems, hiddenCount } = await getApi(query.accountId).workItem.getByQuery(query);
            Query.calculateIconLevel(query, workItems);
            //set query emptiness to sort them
            Query.toggleBoolean(query, "empty", !workItems.length);

            dispatch(dataWorkItemsForQuerySet(query, workItems));
            setHiddenCount(hiddenCount);

            if (errorMessage) setErrorMessage(null);
        } catch (e: any) {
            setErrorMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, query.queryId, query.accountId]);

    const routineStart = useCallback(async () => {
        setIsLoading(true);

        Timers.delete(query.queryId);

        await loadWorkItemsForThisQuery();
        Timers.create(query.queryId, 1000 * refreshRate, () => {
            setIsLoading(true);
            loadWorkItemsForThisQuery();
        });
    }, [dispatch, loadWorkItemsForThisQuery, refreshRate, query.queryId]);

    useEffect(() => {
        routineStart();
        return () => {
            Timers.delete(query.queryId);
        };
    }, [routineStart, query.queryId]);

    return { isLoading, routineStart, errorMessage, hiddenCount };
}
