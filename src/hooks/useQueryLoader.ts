import { useEffect, useState } from "react";
import Platform from "../helpers/Platform";
import WorkItem from "../helpers/WorkItem";
import Loaders from "../helpers/Loaders";
import Query, { IQuery } from "../helpers/Query";
import { useFishWIs } from "../conf";
import { useDispatch, useSelector } from "react-redux";
import { dataWorkItemsForQuerySet } from "../redux/actions/dataActions";
import { Timers } from "../helpers/Timers";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

export function useQueryLoader(query: IQuery) {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    const { refreshRate } = useSelector(settingsSelector);

    useEffect(() => {
        routineStart();
        return () => {
            Timers.delete(query.queryId);
        };
    }, []);

    const routineStart = async () => {
        setIsLoading(true);

        if (useFishWIs === 1 && Platform.current.isDev()) {
            setIsLoading(false);
            dispatch(dataWorkItemsForQuerySet(query, [WorkItem.fish(query), WorkItem.fish(query), WorkItem.fish(query)]));
            return;
        }

        Timers.delete(query.queryId);

        await loadWorkItemsForThisQuery();
        Timers.create(query.queryId, 1000 * refreshRate, () => {
            setIsLoading(true);
            loadWorkItemsForThisQuery();
        });
    };

    const loadWorkItemsForThisQuery = async () => {
        console.log("updating query", query.queryId);
        let wis = await Loaders.loadQueryWorkItems(query);
        Query.calculateIconLevel(query, wis);
        //set query emptiness to sort them
        Query.toggleBoolean(query, "empty", !wis.length);

        dispatch(dataWorkItemsForQuerySet(query, wis));
        setIsLoading(false);
    };

    return isLoading;
}
