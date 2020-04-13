import React, { useState, useEffect } from "react";
import { Header, Label, Table, Icon } from "semantic-ui-react";
import store from "../store";
import Query, { IQuery } from "../helpers/Query";
import { observer } from "mobx-react";
import WorkItemRow from "./WorkItemRow";
import WorkItem, { IWorkItem } from "../helpers/WorkItem";
import Loaders from "../helpers/Loaders";
import Electron from "../helpers/Electron";
import { s } from "../values/Strings";
import Lists from "../helpers/Lists";
import { reaction } from "mobx";

interface IProps {
    query: IQuery;
}

export default observer((props: IProps) => {
  //  const [workItems, setWorkItems] = useState<IWorkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const workItems = store.getWorkItemsForQuery(props.query);

    const onRoutinesRestart = reaction(
        () => store._routinesRestart,
        () => routineStart()
    );
    const onPermawatchUpdate = reaction(
        () => store._permawatchUpdate,
        () => {
            if (props.query.queryId === "___permawatch") loadWorkItemsForThisQuery();
        }
    );

    useEffect(() => {
        routineStart();
        return () => {
            store.clearInterval(props.query);
        };
    }, []);

    const routineStart = async () => {
        setIsLoading(true);
        //setWorkItems([]);
        //store.setWorkItemsForQuery


        if (store.useFishWIs === 1 && Electron.isDev()) {
            setIsLoading(false);
            //setWorkItems([WorkItem.fish(props.query.queryId), WorkItem.fish(props.query.queryId), WorkItem.fish(props.query.queryId)]);
            store.setWorkItemsForQuery(props.query, [WorkItem.fish(props.query.queryId), WorkItem.fish(props.query.queryId), WorkItem.fish(props.query.queryId)])
            return;
        }

        store.clearInterval(props.query);

        await loadWorkItemsForThisQuery();
        store.setInterval(
            props.query,
            setInterval(() => {
                setIsLoading(true);
                loadWorkItemsForThisQuery();
            }, store.settings.refreshRate * 1000)
        );
    };

    const loadWorkItemsForThisQuery = async () => {
        console.log("updating query", props.query.queryId);
        let wis = await Loaders.loadQueryWorkItems(props.query);
        Query.calculateIconLevel(props.query, wis);
        //set query emptiness to sort them
        Query.toggleBoolean(props.query, "empty", !wis.length);
        //setWorkItems(wis);
        store.setWorkItemsForQuery(props.query, wis);
        setIsLoading(false);
    };

    const isPermawatch = props.query.queryId === "___permawatch";

    const totalItems = workItems.filter((wi) => !Lists.isIn("hidden", wi.id, wi.rev)).length;

    const redItems = workItems.filter((wi) => !Lists.isIn("hidden", wi.id, wi.rev)).filter((wi) => wi.promptness === 1 || wi.rank === 1).length;

    const orangeItems = workItems.filter((wi) => !Lists.isIn("hidden", wi.id, wi.rev)).filter((wi) => wi.promptness === 2).length;

    const atLeastOneWiHasChanges = (() => {
        let wis = workItems;
        let changes = false;
        wis.forEach((wi) => {
            if (!changes) changes = store.getWIHasChanges(wi);
        });
        return changes;
    })();

    const onCollapseClick = () => {
        Query.toggleBoolean(props.query, "collapsed");
    };

    const onOpenQueryInBrowser = () => {
        let q = props.query;
        if (!q.queryPath) return;

        let encodedPath = encodeURI(q.queryPath).replace("/", "%2F").replace("&", "%26");

        Electron.openUrl(store.settings.tfsPath + q.teamName + "/_workItems?path=" + encodedPath + "&_a=query");
    };

    const getSortPattern = () => {
        switch (store.settings.sortPattern) {
            case "assignedto":
                return sortPatternAssignedTo;
            case "id":
                return sortPatternId;
            default:
                return sortPatternDefault;
        }
    };

    //todo: move patterns to helper
    const sortByLists = (a: IWorkItem, b: IWorkItem) => {
        if (a._list === "deferred" && b._list !== "deferred") return 1;
        else if (a._list !== "deferred" && b._list === "deferred") return -1;

        if (a._list === "favorites" && b._list !== "favorites") return -1;
        else if (a._list !== "favorites" && b._list === "favorites") return 1;

        if (store.settings.mineOnTop) {
            if (a._isMine && !b._isMine) return -1;
            else if (!a._isMine && b._isMine) return 1;
        }

        return undefined;
    };

    const sortPatternDefault = (a: IWorkItem, b: IWorkItem) => {
        let listRes = sortByLists(a, b);
        if (listRes) return listRes;

        if (a.weight < b.weight) return -1;
        else if (a.weight > b.weight) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    const sortPatternAssignedTo = (a: IWorkItem, b: IWorkItem) => {
        let listRes = sortByLists(a, b);
        if (listRes) return listRes;

        if (a.assignedTo < b.assignedTo) return -1;
        else if (a.assignedTo > b.assignedTo) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    const sortPatternId = (a: IWorkItem, b: IWorkItem) => {
        let listRes = sortByLists(a, b);
        if (listRes) return listRes;

        if (a.id < b.id) return -1;
        else return 1;
    };

    const dropAllWiChanges = () => {
        workItems.forEach((wi) => {
            store.setWIHasChanges(wi, false);
        });
    };

    const updateWorkItems = (wi: IWorkItem) => {
        let newList = workItems.filter((w) => w.id !== wi.id);
        newList.push(wi);
        //setWorkItems(newList);
        store.setWorkItemsForQuery(props.query, newList);
    };

    const query = props.query;
    const workItemsComponents = workItems
        .sort(getSortPattern())
        .filter((wi) => !Lists.isIn("hidden", wi.id, wi.rev))
        .map((wi) => <WorkItemRow key={wi.id} item={wi} isPermawatch={isPermawatch} onUpdate={updateWorkItems} />);

    const iconCollapse = query.collapsed ? <Icon name="angle right" /> : <Icon name="angle down" />;

    return (
        <>
            <Header as="h3" dividing>
                {isLoading && (
                    <span>
                        <Icon name="circle notched" loading />
                    </span>
                )}
                {!isLoading && !!workItems.length && !isPermawatch && <span onClick={onCollapseClick}>{iconCollapse}</span>}
                <span onClick={dropAllWiChanges}>
                    <span onClick={onCollapseClick}>
                        {isPermawatch && (
                            <span>
                                <Icon name="eye" />
                            </span>
                        )}
                        {query.queryName}
                    </span>
                    <small>
                        <span style={{ marginLeft: 10, color: "gray" }}>{query.teamName}</span>
                    </small>
                </span>
                <span className="WICounts">
                    {!!redItems && (
                        <Label size="mini" circular color="red">
                            {redItems}
                        </Label>
                    )}
                    {!!orangeItems && (
                        <Label size="mini" circular color="orange">
                            {orangeItems}
                        </Label>
                    )}
                    {!!totalItems && (
                        <Label size="mini" circular>
                            {totalItems}
                        </Label>
                    )}
                    {!totalItems && !isLoading && (
                        <Label size="small" circular color="green">
                            ✔
                        </Label>
                    )}
                </span>
                {!!query.queryPath && (
                    <span title={s("openExternal")} className="externalLink" onClick={onOpenQueryInBrowser}>
                        <Icon size="small" name="external share" />
                    </span>
                )}
            </Header>
            {!!workItems.length && !query.collapsed && (
                <Table compact size="small">
                    <tbody>{workItemsComponents}</tbody>
                </Table>
            )}
        </>
    );
});
