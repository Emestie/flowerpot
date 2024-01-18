import { useDispatch, useSelector } from "react-redux";
import { Header, Icon, Label, Message, Table } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import Query from "../../helpers/Query";
import { useQueryLoader } from "../../hooks/useQueryLoader";
import { dataChangesCollectionClear, dataWorkItemsForQuerySet } from "../../redux/actions/dataActions";
import { appSelector } from "../../redux/selectors/appSelectors";
import { getWorkItemsForQuerySelector } from "../../redux/selectors/dataSelectors";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { WorkItemRow } from "./WorkItemRow";
import { IQuery, IWorkItem } from "/@/modules/api-client";

interface IProps {
    query: IQuery;
    filter: string;
}

export function WorkItemsBlock(props: IProps) {
    const { isLoading, routineStart, errorMessage } = useQueryLoader(props.query);
    const allItems = useSelector(getWorkItemsForQuerySelector(props.query));
    const settings = useSelector(settingsSelector);
    const { showMineOnly } = useSelector(appSelector);

    const dispatch = useDispatch();

    const filterValue = props.filter && props.filter.trim() ? props.filter.trim().toLowerCase() : "";

    const filteredItems = () => {
        if (!filterValue) {
            allItems.forEach((x) => {
                x._filteredBy = {};
            });
            return allItems;
        }
        const filtered = allItems.filter((i) => {
            let flag = false;
            const itf = (i.titleFull || "").toLowerCase().indexOf(filterValue);
            const iid = (i.id || "").toString().indexOf(filterValue);
            const iatf = (i.assignedToFull || "").toLowerCase().indexOf(filterValue);
            const icbf = (i.createdByFull || "").toLowerCase().indexOf(filterValue);
            const iitp = (i.iterationPath || "").toLowerCase().indexOf(filterValue);

            if (itf !== -1) {
                flag = true;
                i._filteredBy["titleFull"] = filterValue;
            } else {
                i._filteredBy["titleFull"] = undefined;
            }

            if (iid !== -1) {
                flag = true;
                i._filteredBy["id"] = filterValue;
            } else {
                i._filteredBy["id"] = undefined;
            }

            if (iatf !== -1) {
                flag = true;
                i._filteredBy["assignedToFull"] = filterValue;
            } else {
                i._filteredBy["assignedToFull"] = undefined;
            }

            if (icbf !== -1) {
                flag = true;
                i._filteredBy["createdByFull"] = filterValue;
            } else {
                i._filteredBy["createdByFull"] = undefined;
            }

            if (iitp !== -1) {
                flag = true;
                i._filteredBy["iterationPath"] = filterValue;
            } else {
                i._filteredBy["iterationPath"] = undefined;
            }

            return flag;
        });
        return filtered;
    };

    const workItems = filteredItems();

    const isPermawatch = props.query.queryId === "___permawatch";
    const totalItemsCount = workItems.filter(
        (wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev)
    ).length;
    const redItemsCount = workItems
        .filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev))
        .filter((wi) => wi.isRed).length;
    const orangeItemsCount = workItems
        .filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev))
        .filter((wi) => wi.isOrange).length;

    const onCollapseClick = () => {
        Query.toggleBoolean(props.query, "collapsed");
    };

    const onOpenQueryInBrowser = () => {
        let q = props.query;
        if (!q.queryPath) return;

        let encodedPath = encodeURI(q.queryPath).replace("/", "%2F").replace("&", "%26");

        Platform.current.openUrl(
            settings.tfsPath + q.collectionName + "/" + q.teamName + "/_workItems?path=" + encodedPath + "&_a=query"
        );
    };

    const getSortPattern = () => {
        switch (settings.sortPattern) {
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

        if (settings.mineOnTop) {
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
        dispatch(dataChangesCollectionClear());
        // workItems.forEach((wi) => {
        //     dispatch(dataChangesCollectionItemSet(wi, false))
        // });
    };

    const updateWorkItems = (wi: IWorkItem) => {
        let newList = workItems.filter((w) => w.id !== wi.id);
        newList.push(wi);
        //store.setWorkItemsForQuery(props.query, newList);
        dispatch(dataWorkItemsForQuerySet(props.query, newList));
    };

    const refreshBlock = () => {
        routineStart();
    };

    const query = props.query;
    const workItemsComponents = workItems
        .sort(getSortPattern())
        .filter((wi) => (showMineOnly ? wi._isMine : true))
        .filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev))
        .map((wi) => (
            <WorkItemRow
                key={wi.id}
                query={props.query}
                item={wi}
                isPermawatch={isPermawatch}
                onUpdate={updateWorkItems}
            />
        ));

    const iconCollapse = query.collapsed ? <Icon name="angle right" /> : <Icon name="angle down" />;

    const getTableSize = () => {
        return settings.tableScale === 1 ? undefined : settings.tableScale === 2 ? "large" : "small";
    };

    return (
        <>
            <Header as="h3" dividing>
                {isLoading && (
                    <span>
                        <Icon name="circle notched" loading />
                    </span>
                )}
                {!isLoading && !!workItems.length && <span onClick={onCollapseClick}>{iconCollapse}</span>}
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
                    {!!redItemsCount && (
                        <Label size="mini" circular color="red">
                            {redItemsCount}
                        </Label>
                    )}
                    {!!orangeItemsCount && (
                        <Label size="mini" circular color="orange">
                            {orangeItemsCount}
                        </Label>
                    )}
                    {!!totalItemsCount && (
                        <Label size="mini" circular>
                            {totalItemsCount}
                        </Label>
                    )}
                    {!totalItemsCount &&
                        !isLoading &&
                        (!errorMessage ? (
                            <Label size="mini" circular color="green">
                                ✔
                            </Label>
                        ) : (
                            <Label size="mini" circular color="red">
                                &times;
                            </Label>
                        ))}
                </span>
                {!!query.queryPath && (
                    <span title={s("openExternal")} className="externalLink" onClick={onOpenQueryInBrowser}>
                        <Icon size="small" name="external share" />
                    </span>
                )}
                {!isLoading && (
                    <span title={s("refresh")} className="externalLink" onClick={refreshBlock}>
                        <Icon size="small" name="refresh" />
                    </span>
                )}
            </Header>
            {!!errorMessage && (
                <Message size="tiny" error>
                    {errorMessage}
                </Message>
            )}
            {!!workItems.length && !query.collapsed && (
                <Table compact size={getTableSize()}>
                    <tbody>{workItemsComponents}</tbody>
                </Table>
            )}
        </>
    );
}
