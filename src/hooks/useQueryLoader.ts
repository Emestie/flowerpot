import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../api/client";
import Platform from "../helpers/Platform";
import Query, { IQuery } from "../helpers/Query";
import { Timers } from "../helpers/Timers";
import WorkItem from "../helpers/WorkItem";
import { dataWorkItemsForQuerySet } from "../redux/actions/dataActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

const useFishWIs = !!import.meta.env.VITE_USE_FISH;

export function useQueryLoader(query: IQuery) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const dispatch = useDispatch();
    const { refreshRate } = useSelector(settingsSelector);

    const loadWorkItemsForThisQuery = useCallback(async () => {
        console.log("updating query ->", query.queryName, `(${query.queryId})`);
        try {
            const workItems = await api.workItem.getByQuery(query);
            Query.calculateIconLevel(query, workItems);
            //set query emptiness to sort them
            Query.toggleBoolean(query, "empty", !workItems.length);

            dispatch(dataWorkItemsForQuerySet(query, workItems));

            if (errorMessage) setErrorMessage(null);
        } catch (e: any) {
            setErrorMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, query]);

    const routineStart = useCallback(async () => {
        setIsLoading(true);

        if (useFishWIs && Platform.current.isDev()) {
            setIsLoading(false);
            dispatch(
                dataWorkItemsForQuerySet(query, [WorkItem.fish(query), WorkItem.fish(query), WorkItem.fish(query)]),
            );
            return;
        }

        Timers.delete(query.queryId);

        await loadWorkItemsForThisQuery();
        Timers.create(query.queryId, 1000 * refreshRate, () => {
            setIsLoading(true);
            loadWorkItemsForThisQuery();
        });
    }, [dispatch, loadWorkItemsForThisQuery, refreshRate, query]);

    useEffect(() => {
        routineStart();
        return () => {
            Timers.delete(query.queryId);
        };
    }, [routineStart, query.queryId]);

    return { isLoading, routineStart, errorMessage };
}
