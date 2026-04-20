import { useMemo } from "react";
import { Icon, Message, Table } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import QueryHelper from "../../helpers/Query";
import { useQueryLoader } from "../../hooks/useQueryLoader";
import { Query } from "../../models/query";
import { WorkItem } from "../../models/work-item";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { useDataStore } from "../../zustand/data";
import { useSettingsStore } from "../../zustand/settings";
import { CollapsibleBlock } from "../CollapsibleBlock";
import { FilterToggleButton } from "../FilterToggleButton";
import { WorkItemRow } from "./WorkItemRow";
import { useFilteredWorkItems } from "./use-filtered-work-items";

interface IProps {
    query: Query;
}

export function WorkItemsBlock(props: IProps) {
    const { isLoading, routineStart, errorMessage, hiddenCount } = useQueryLoader(props.query);
    const accounts = useSettingsStore((state) => state.accounts);
    const sortPattern = useSettingsStore((state) => state.sortPattern);
    const tableScale = useSettingsStore((state) => state.tableScale);
    const showEmptyQueries = useSettingsStore((state) => state.showEmptyQueries);
    const enableQueryColorCode = useSettingsStore((state) => state.enableQueryColorCode);
    const mineOnTop = useSettingsStore((state) => state.mineOnTop);
    const showMineOnly = useAppStore((state) => state.showMineOnly);
    const filteredTypes = props.query.filteredTypes || [];
    const filteredStatuses = props.query.filteredStatuses || [];

    const setWorkItemsForQuery = useDataStore((state) => state.setWorkItemsForQuery);

    const workItems = useFilteredWorkItems(props.query);

    const availableTypes = useMemo(() => {
        const types = new Map<string, string | undefined>();
        workItems.forEach((wi) => {
            if (wi.type && !types.has(wi.type)) {
                types.set(wi.type, wi.typeIconUrl);
            }
        });
        return Array.from(types.entries())
            .map(([type, url]) => ({ type, url }))
            .sort((a, b) => a.type.localeCompare(b.type));
    }, [workItems]);

    const availableStatuses = useMemo(() => {
        const statuses = new Map<string, string | undefined>();
        workItems.forEach((wi) => {
            if (wi.state && !statuses.has(wi.state)) {
                statuses.set(wi.state, wi.stateColor);
            }
        });
        return Array.from(statuses.entries())
            .map(([state, color]) => ({ state, color }))
            .sort((a, b) => a.state.localeCompare(b.state));
    }, [workItems]);

    const isPermawatch = props.query.queryId.startsWith("___permawatch");
    const totalItemsCount = workItems
        .filter((wi) => !filteredTypes.includes(wi.type))
        .filter((wi) => !filteredStatuses.includes(wi.state))
        .filter((wi) => !Lists.isIn(props.query.accountId, "hidden", props.query.collectionName, wi.id, wi.rev)).length;
    const redItemsCount = workItems
        .filter((wi) => !filteredTypes.includes(wi.type))
        .filter((wi) => !filteredStatuses.includes(wi.state))
        .filter((wi) => !Lists.isIn(props.query.accountId, "hidden", props.query.collectionName, wi.id, wi.rev))
        .filter((wi) => wi.isRed).length;

    const onOpenQueryInBrowser = () => {
        let q = props.query;
        if (!q.queryPath) return;

        const accountUrl = accounts.find((x) => x.id === props.query.accountId)?.url;
        if (!accountUrl) return;

        let encodedPath = encodeURI(q.queryPath).replace("/", "%2F").replace("&", "%26");

        const qurl = `${accountUrl + q.collectionName}/${q.teamName}/_workItems?path=${encodedPath}&_a=query`;
        Platform.current.openUrl(qurl);
    };

    const getSortPattern = () => {
        switch (sortPattern) {
            case "assignedto":
                return sortPatternAssignedTo;
            case "id":
                return sortPatternId;
            default:
                return sortPatternDefault;
        }
    };

    const sortByLists = (a: WorkItem, b: WorkItem) => {
        if (a._list === "deferred" && b._list !== "deferred") return 1;
        else if (a._list !== "deferred" && b._list === "deferred") return -1;

        if (a._list === "pinned" && b._list !== "pinned") return -1;
        else if (a._list !== "pinned" && b._list === "pinned") return 1;

        if (mineOnTop) {
            if (a._isMine && !b._isMine) return -1;
            else if (!a._isMine && b._isMine) return 1;
        }

        return undefined;
    };

    const sortPatternDefault = (a: WorkItem, b: WorkItem) => {
        let listRes = sortByLists(a, b);
        if (listRes) return listRes;

        if ((a.priority ?? 99) < (b.priority ?? 99)) return -1;
        else if ((a.priority ?? 99) > (b.priority ?? 99)) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    const sortPatternAssignedTo = (a: WorkItem, b: WorkItem) => {
        let listRes = sortByLists(a, b);
        if (listRes) return listRes;

        if (a.assignedTo < b.assignedTo) return -1;
        else if (a.assignedTo > b.assignedTo) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    const sortPatternId = (a: WorkItem, b: WorkItem) => {
        let listRes = sortByLists(a, b);
        if (listRes) return listRes;

        if (a.id < b.id) return -1;
        else return 1;
    };

    const updateWorkItems = (wi: WorkItem) => {
        let newList = workItems.filter((w) => w.id !== wi.id);
        newList.push(wi);
        setWorkItemsForQuery(props.query, newList);
    };

    const refreshBlock = () => {
        routineStart();
    };

    const query = props.query;
    const workItemsComponents = workItems
        .sort(getSortPattern())
        .filter((wi) => (showMineOnly ? wi._isMine : true))
        .filter((wi) => !Lists.isIn(props.query.accountId, "hidden", props.query.collectionName, wi.id, wi.rev))
        .filter((wi) => !filteredTypes.includes(wi.type))
        .filter((wi) => !filteredStatuses.includes(wi.state))
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
        return tableScale === 1 ? undefined : tableScale === 2 ? "large" : "small";
    };

    if (query.empty && !showEmptyQueries) {
        return null;
    }

    return (
        <CollapsibleBlock
            id={`${query.accountId}-${query.queryId}`}
            caption={query.queryName}
            accountId={query.accountId}
            subcaption={query.teamName}
            subcaptionTooltip={query.collectionName}
            enableColorCode={!isPermawatch && enableQueryColorCode}
            isCollapseEnabled={!!workItems.length}
            isLoading={isLoading}
            iconComponent={isPermawatch ? <Icon name="eye" /> : null}
            counters={{
                total: { count: totalItemsCount },
                red: { count: redItemsCount, color: "red" },
                hidden: { count: hiddenCount, basic: true },
            }}
            status={!totalItemsCount && !isLoading && !errorMessage ? "done" : errorMessage ? "error" : undefined}
            rightBlock={
                <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "flex-end", gap: 6 }}>
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
                    {availableTypes.map((t) => (
                        <FilterToggleButton
                            key={t.type}
                            label={t.type}
                            hintPrefix={s("filterTypePrefix")}
                            checked={!filteredTypes.includes(t.type)}
                            onChange={() => {
                                if (filteredTypes.includes(t.type)) {
                                    QueryHelper.updateFilteredTypes(
                                        props.query,
                                        filteredTypes.filter((x) => x !== t.type)
                                    );
                                } else {
                                    QueryHelper.updateFilteredTypes(props.query, [...filteredTypes, t.type]);
                                }
                            }}
                            imgUrl={t.url}
                        />
                    ))}
                    {availableStatuses.map((st) => (
                        <FilterToggleButton
                            key={st.state}
                            label={st.state}
                            hintPrefix={s("filterStatusPrefix")}
                            checked={!filteredStatuses.includes(st.state)}
                            onChange={() => {
                                if (filteredStatuses.includes(st.state)) {
                                    QueryHelper.updateFilteredStatuses(
                                        props.query,
                                        filteredStatuses.filter((x) => x !== st.state)
                                    );
                                } else {
                                    QueryHelper.updateFilteredStatuses(props.query, [...filteredStatuses, st.state]);
                                }
                            }}
                            colorDot={st.color ? "#" + st.color : undefined}
                        />
                    ))}
                </div>
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
