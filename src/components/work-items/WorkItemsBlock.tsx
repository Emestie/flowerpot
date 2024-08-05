import { useDispatch, useSelector } from "react-redux";
import { Header, Icon, Label, Message, Table } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import Query from "../../helpers/Query";
import { useQueryLoader } from "../../hooks/useQueryLoader";
import { dataChangesCollectionClear, dataWorkItemsForQuerySet } from "../../redux/actions/dataActions";
import { appSelector } from "../../redux/selectors/appSelectors";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { WorkItemRow } from "./WorkItemRow";
import { useFilteredWorkItems } from "./use-filtered-work-items";
import { IQuery, IWorkItem } from "/@/modules/api-client";
import { tagPalette } from "/@/modules/palette";

interface IProps {
    query: IQuery;
}

export function WorkItemsBlock(props: IProps) {
    const { isLoading, routineStart, errorMessage } = useQueryLoader(props.query);
    const settings = useSelector(settingsSelector);
    const { showMineOnly } = useSelector(appSelector);

    const dispatch = useDispatch();

    const workItems = useFilteredWorkItems(props.query);

    const isPermawatch = props.query.queryId === "___permawatch";
    const totalItemsCount = workItems.filter(
        (wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev)
    ).length;
    const redItemsCount = workItems
        .filter((wi) => !Lists.isIn("hidden", props.query.collectionName, wi.id, wi.rev))
        .filter((wi) => wi.isRed).length;

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

        if ((a.priority ?? 99) < (b.priority ?? 99)) return -1;
        else if ((a.priority ?? 99) > (b.priority ?? 99)) return 1;

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
                    <span
                        onClick={onCollapseClick}
                        style={
                            isPermawatch || !settings.enableQueryColorCode
                                ? undefined
                                : {
                                      backgroundColor: tagPalette
                                          .getColor(query.queryName)
                                          .hexWithTransparency(settings.darkTheme ? 0.3 : 0.2),
                                      padding: "0 8px",
                                      borderRadius: 4,
                                  }
                        }
                    >
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
                <Table className="wiTable" compact size={getTableSize()}>
                    <tbody>{workItemsComponents}</tbody>
                </Table>
            )}
        </>
    );
}
