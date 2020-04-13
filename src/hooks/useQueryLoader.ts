import { useEffect, useState } from "react";
import store from "../store";
import Electron from "../helpers/Electron";
import WorkItem from "../helpers/WorkItem";
import Loaders from "../helpers/Loaders";
import Query, { IQuery } from "../helpers/Query";
import { reaction } from "mobx";

export default function useQueryLoader(query: IQuery) {
    const [isLoading, setIsLoading] = useState(true);

    const onRoutinesRestart = reaction(
        () => store._routinesRestart,
        () => routineStart()
    );
    const onPermawatchUpdate = reaction(
        () => store._permawatchUpdate,
        () => {
            if (query.queryId === "___permawatch") loadWorkItemsForThisQuery();
        }
    );

    useEffect(() => {
        routineStart();
        return () => {
            store.clearInterval(query);
        };
    }, []);

    const routineStart = async () => {
        setIsLoading(true);

        if (store.useFishWIs === 1 && Electron.isDev()) {
            setIsLoading(false);
            store.setWorkItemsForQuery(query, [WorkItem.fish(query.queryId), WorkItem.fish(query.queryId), WorkItem.fish(query.queryId)]);
            return;
        }

        store.clearInterval(query);

        await loadWorkItemsForThisQuery();
        store.setInterval(
            query,
            setInterval(() => {
                setIsLoading(true);
                loadWorkItemsForThisQuery();
            }, store.settings.refreshRate * 1000)
        );
    };

    const loadWorkItemsForThisQuery = async () => {
        console.log("updating query", query.queryId);
        let wis = await Loaders.loadQueryWorkItems(query);
        Query.calculateIconLevel(query, wis);
        //set query emptiness to sort them
        Query.toggleBoolean(query, "empty", !wis.length);

        store.setWorkItemsForQuery(query, wis);
        setIsLoading(false);
    };

    return isLoading;
}
