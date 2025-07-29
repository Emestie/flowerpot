import { useDispatch, useSelector } from "react-redux";
import { Icon, Message, Table } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { useQueryLoader } from "../../hooks/useQueryLoader";
import { dataWorkItemsForQuerySet } from "../../redux/actions/dataActions";
import { appSelector } from "../../redux/selectors/appSelectors";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { CollapsibleBlock } from "../CollapsibleBlock";
import { WorkItemRow } from "./WorkItemRow";
import { useFilteredWorkItems } from "./use-filtered-work-items";
import { IQuery, IWorkItem } from "/@/modules/api-client";

interface IProps {
    query: IQuery;
}

export function WorkItemsBlock(props: IProps) {
    const { isLoading, routineStart, errorMessage } = useQueryLoader(props.query);
    const settings = useSelector(settingsSelector);
    const { showMineOnly } = useSelector(appSelector);

    const dispatch = useDispatch();

    const workItems = useFilteredWorkItems(props.query);

    const isPermawatch = props.query.queryId.startsWith("___permawatch");
    const totalItemsCount = workItems.filter(
        (wi) => !Lists.isIn(props.query.accountId, "hidden", props.query.collectionName, wi.id, wi.rev)
    ).length;
    const redItemsCount = workItems
        .filter((wi) => !Lists.isIn(props.query.accountId, "hidden", props.query.collectionName, wi.id, wi.rev))
        .filter((wi) => wi.isRed).length;

    const onOpenQueryInBrowser = () => {
        let q = props.query;
        if (!q.queryPath) return;

        let encodedPath = encodeURI(q.queryPath).replace("/", "%2F").replace("&", "%26");

        Platform.current.openUrl(
            `${
                settings.accounts.find((x) => x.id === props.query.accountId) + q.collectionName
            }/${q.teamName}/_workItems?path=${encodedPath}&_a=query`
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
        .filter((wi) => !Lists.isIn(props.query.accountId, "hidden", props.query.collectionName, wi.id, wi.rev))
        .map((wi) => (
            <WorkItemRow
                key={wi.id}
                query={props.query}
                item={wi}
                isPermawatch={isPermawatch}
                onUpdate={updateWorkItems}
            />
        ));

    const getTableSize = () => {
        return settings.tableScale === 1 ? undefined : settings.tableScale === 2 ? "large" : "small";
    };

    return (
        <CollapsibleBlock
            id={`${query.accountId}-${query.queryId}`}
            caption={query.queryName}
            accountId={query.accountId}
            subcaption={query.teamName}
            subcaptionTooltip={query.collectionName}
            enableColorCode={!isPermawatch && settings.enableQueryColorCode}
            isCollapseEnabled={!!workItems.length}
            isLoading={isLoading}
            iconComponent={isPermawatch ? <Icon name="eye" /> : null}
            counters={{ total: { count: totalItemsCount }, red: { count: redItemsCount, color: "red" } }}
            status={!totalItemsCount && !isLoading && !errorMessage ? "done" : errorMessage ? "error" : undefined}
            rightBlock={
                <>
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
                </>
            }
        >
            <>
                {!!errorMessage && (
                    <Message size="tiny" error>
                        {errorMessage}
                    </Message>
                )}
                {!!workItems.length && (
                    <Table className="wiTable" compact size={getTableSize()}>
                        <tbody>{workItemsComponents}</tbody>
                    </Table>
                )}
            </>
        </CollapsibleBlock>
    );
}
