import { useEffect, useState } from "react";
import Platform from "../helpers/Platform";
import WorkItem from "../helpers/WorkItem";
import Loaders from "../helpers/Loaders";
import Query, { IQuery } from "../helpers/Query";
import { useFishWIs } from "../conf";
import { useDispatch } from "react-redux";
import { dataWorkItemsForQuerySet } from "../redux/actions/dataActions";

export function useQueryLoader(query: IQuery) {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        routineStart();
        return () => {
            //!     store.clearInterval(query);
        };
    }, []);

    const routineStart = async () => {
        setIsLoading(true);

        if (useFishWIs === 1 && Platform.current.isDev()) {
            setIsLoading(false);
            //store.setWorkItemsForQuery(query, [WorkItem.fish(query), WorkItem.fish(query), WorkItem.fish(query)]);
            dispatch(dataWorkItemsForQuerySet(query, [WorkItem.fish(query), WorkItem.fish(query), WorkItem.fish(query)]));
            return;
        }

        //!   store.clearInterval(query);

        await loadWorkItemsForThisQuery();
        //! store.setInterval(
        //     query,
        //     setInterval(() => {
        //         setIsLoading(true);
        //         loadWorkItemsForThisQuery();
        //     }, store.settings.refreshRate * 1000)
        // );
    };

    const loadWorkItemsForThisQuery = async () => {
        console.log("updating query", query.queryId);
        let wis = await Loaders.loadQueryWorkItems(query);
        Query.calculateIconLevel(query, wis);
        //set query emptiness to sort them
        Query.toggleBoolean(query, "empty", !wis.length);

        //store.setWorkItemsForQuery(query, wis);
        dispatch(dataWorkItemsForQuerySet(query, wis));
        setIsLoading(false);
    };

    return isLoading;
}
