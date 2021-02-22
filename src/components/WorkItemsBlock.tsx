import React, { useEffect } from "react";
import { Header, Label, Table, Icon } from "semantic-ui-react";
import store from "../store";
import Query, { IQuery } from "../helpers/Query";
import { observer } from "mobx-react";
import WorkItemRow from "./WorkItemRow";
import { IWorkItem } from "../helpers/WorkItem";
import Platform from "../helpers/Platform";
import { s } from "../values/Strings";
import Lists from "../helpers/Lists";
import useQueryLoader from "../hooks/useQueryLoader";

interface IProps {
    query: IQuery;
    filter: string;
}

export default observer((props: IProps) => {
    const isLoading = useQueryLoader(props.query);
    const allItems = store.getWorkItemsForQuery(props.query);
    const filterValue = props.filter && props.filter.trim() ? props.filter.trim().toLowerCase() : "";
    const filteredItems = () => {
        console.log(!filterValue)
        if (!filterValue) return allItems;
        const filtered = allItems.filter(i => (i.titleFull || "").toLowerCase().indexOf(filterValue) != -1 || (i.id || "").toString().indexOf(filterValue) != -1 || (i.assignedToFull || "").toLowerCase().indexOf(filterValue) != -1 || (i.createdByFull || "").toLowerCase().indexOf(filterValue) != -1);
        return filtered;
    }
    const workItems = filteredItems();

    const isPermawatch = props.query.queryId === "___permawatch";
    const totalItems = workItems.filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev)).length;
    const redItems = workItems
        .filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev))
        .filter((wi) => wi.promptness === 1 || wi.rank === 1).length;
    const orangeItems = workItems.filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev)).filter((wi) => wi.promptness === 2)
        .length;

    useEffect(() => {
        let newProgressList = store.copy(store.loadingInProgressList);
        if (isLoading) {
            newProgressList.push(props.query.queryId);
        } else {
            newProgressList = newProgressList.filter((x) => x !== props.query.queryId);
        }
        store.loadingInProgressList = newProgressList;
    }, [isLoading]);

    const onCollapseClick = () => {
        Query.toggleBoolean(props.query, "collapsed");
    };

    const onOpenQueryInBrowser = () => {
        let q = props.query;
        if (!q.queryPath) return;

        let encodedPath = encodeURI(q.queryPath).replace("/", "%2F").replace("&", "%26");

        Platform.openUrl(store.settings.tfsPath + q.collectionName + "/" + q.teamName + "/_workItems?path=" + encodedPath + "&_a=query");
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

    const sortByLists = (a: IWorkItem, b: IWorkItem) => {
        if (a._list === "deferred" && b._list !== "deferred") return 1;
        else if (a._list !== "deferred" && b._list === "deferred") return -1;

        if (a._list === "pinned" && b._list !== "pinned") return -1;
        else if (a._list !== "pinned" && b._list === "pinned") return 1;

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
        store.setWorkItemsForQuery(props.query, newList);
    };

    const query = props.query;
    const workItemsComponents = workItems
        .sort(getSortPattern())
        .filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev))
        .map((wi) => <WorkItemRow key={wi.id} query={props.query} item={wi} isPermawatch={isPermawatch} onUpdate={updateWorkItems} />);

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
                        <span style={{ marginLeft: 10, color: "gray" }} title={query.collectionName}>
                            {query.teamName}
                        </span>
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
