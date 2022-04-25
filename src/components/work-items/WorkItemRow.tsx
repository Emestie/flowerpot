import React from "react";
import { ContextMenuTrigger } from "react-contextmenu";
import { useDispatch, useSelector } from "react-redux";
import { Icon, Label, Table } from "semantic-ui-react";
import Festival from "../../helpers/Festival";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { IQuery } from "../../helpers/Query";
import WorkItem, { IWorkItem } from "../../helpers/WorkItem";
import { dataChangesCollectionItemSet } from "../../redux/actions/dataActions";
import { dataSelector } from "../../redux/selectors/dataSelectors";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { WorkItemRowContextMenu } from "./WorkItemRowContextMenu";

interface IProps {
    item: IWorkItem;
    query: IQuery;
    isPermawatch: boolean;
    onUpdate: (wi: IWorkItem) => void;
}

export function WorkItemRow(props: IProps) {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const { changesCollection } = useSelector(dataSelector);

    const isRed = WorkItem.isRed(props.item);
    const isOrange = WorkItem.isOrange(props.item);

    const importanceEl = (() => {
        if (!props.item.importance) return undefined;
        return (
            <span title={s("severity") + props.item.importanceText}>
                <span style={{ fontSize: 12 }}>
                    <Icon name="exclamation triangle" />
                </span>
                {props.item.importance}
            </span>
        );
    })();

    const promptnessEl = (() => {
        if (!props.item.promptness) return undefined;
        return (
            <span title={s("priority") + props.item.promptnessText} style={{ marginLeft: 4 }}>
                <span style={{ fontSize: 12 }}>
                    <Icon name="clock" />
                </span>
                {props.item.promptness}
            </span>
        );
    })();

    const rankEl = (() => {
        if (props.item.rank === undefined) return undefined;
        return (
            <span title={"Rank " + props.item.rank}>
                <span style={{ fontSize: 12 }}>
                    <Icon name="chess queen" />
                </span>
                {props.item.rank}
            </span>
        );
    })();

    const revEl = (() => {
        return (
            <span title={s("revision")}>
                <span>
                    <Icon name="redo" />
                </span>
                {props.item.rev}
            </span>
        );
    })();

    const freshnessEl = (() => {
        return (
            <span
                title={s("timeSinceCreated") + ` (${new Date(props.item.createdDate).toLocaleString()})`}
                style={{ marginLeft: 4 }}
            >
                <span>
                    <Icon name="leaf" />
                </span>
                {props.item.freshness}
            </span>
        );
    })();

    const typeEl = (() => {
        switch (props.item.type) {
            case "Bug":
                return <Icon name="bug" />;
            case "Task":
                return <Icon name="check" />;
            case "Issue":
                return <Icon name="question" />;
            case "Feature":
                return <Icon name="trophy" />;
            case "User Story":
                return <Icon name="book" />;
            case "Epic":
                return <Icon name="chess queen" />;
            default:
                return <Icon name="fire" />;
        }
    })();

    const dropChanges = () => {
        dispatch(dataChangesCollectionItemSet(props.item, false));
    };

    const getClass = () => {
        const item = props.item;
        if (Lists.isIn("favorites", props.query.collectionName, item.id)) return "workItemFavorite";
        if (Lists.isIn("pinned", props.query.collectionName, item.id)) return "workItemPinned";
        if (Lists.isIn("deferred", props.query.collectionName, item.id)) return "workItemDeferred";
        if (Lists.isIn("permawatch", props.query.collectionName, item.id)) return "workItemPermawatch";
        if (Lists.isInText("keywords", item.titleFull)) return "workItemKeyword";
        if (item._isMine) return "workItemIsMine";
        return "workItemHasNoCanges";
    };

    const getNote = () => {
        let note = fullNote;
        if (note && note.length > 50) {
            note = note.slice(0, 50) + "...";
        }
        return note;
    };

    const fullNote = (() => {
        let note = Lists.getNote(props.item._collectionName, props.item.id);
        return note;
    })();

    const noteColor = (() => {
        let color = Lists.getNoteColor(props.item._collectionName, props.item.id);
        return color;
    })();

    const getListIndicator = () => {
        let item = props.item;

        if (Lists.isIn("permawatch", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorPermawatch">
                    <Icon name="eye" />
                </span>
            );

        if (Lists.isIn("deferred", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorDeferred">
                    <Icon name="clock outline" />
                </span>
            );

        if (Lists.isIn("favorites", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorFavorite">
                    <Icon name="star" />
                </span>
            );

        if (Lists.isIn("pinned", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorPinned">
                    <Icon name="pin" />
                </span>
            );

        return undefined;
    };

    const getStatusIcon = (state: string) => {
        if (!state) return null;

        switch (state) {
            case "Active":
            case "Активный":
                return <Icon name="angle double right" />; // code
            case "К реализации":
                return <Icon name="hand point right outline" />;
            case "В обсуждении":
                return <Icon name="comments outline" />;
            case "Closed":
            case "Закрыт":
            case "Закрыто":
                return <Icon name="window close outline" />;
            case "Resolved":
            case "Реализовано":
                return <Icon name="check square outline" />;
            case "New":
            case "Новый":
                return <Icon name="genderless" />;
            case "Ready for Review":
                return <Icon name="hand paper outline" />;
            default:
                return <>{state}</>;
        }
    };

    const item = props.item;
    const hasChanges = settings.showUnreads ? !!changesCollection[item.id] : false;
    const uid = props.item.id + Math.random() + "";

    const [isDone, doneByUser] = [false, "user"];

    const yellowMarkedVal = (field: string) => {
        if (item._filteredBy[field] === undefined) return (item as any)[field];

        const val = (item as any)[field] + "" || "";
        const splittee = item._filteredBy[field];
        const pieces = val.toLocaleLowerCase().split(splittee);

        const splitteeLength = splittee.length;

        const trueValPieces: any[] = [];

        let start = 0;
        pieces.forEach((x) => {
            const xLen = x.length;
            const p = val.slice(start, start + xLen);
            const spl = val.slice(start + xLen, start + xLen + splitteeLength);
            trueValPieces.push(p, spl);
            start = start + xLen + splitteeLength;
        });

        const returnee: any[] = [];
        trueValPieces.forEach((x: any, i: number) => {
            if (i % 2 === 0) returnee.push(<React.Fragment key={Math.random()}>{x}</React.Fragment>);
            else
                returnee.push(
                    <span key={Math.random()} className="marked">
                        {x}
                    </span>
                );
        });

        return returnee;
    };

    const tags = item.tags
        ? item.tags
              .split(";")
              .map((x) => x.trim())
              .map((x) => (
                  <Label key={Math.random()} size="mini" basic style={{ padding: "3px 4px", marginRight: 2 }}>
                      {x}
                  </Label>
              ))
        : null;

    return (
        <Table.Row warning={isOrange} negative={isRed} onClick={dropChanges} className={getClass()}>
            <Table.Cell
                collapsing
                className={"cellRelative " + getClass()}
                onDoubleClick={() => {
                    Platform.current.copyString(item.id.toString());
                }}
            >
                <ContextMenuTrigger id={uid}>
                    {hasChanges && <span title={s("newItem")} className="HasChangesDot"></span>}
                    <span title={item.type}>
                        {typeEl} {yellowMarkedVal("id")}
                    </span>
                </ContextMenuTrigger>

                <WorkItemRowContextMenu uid={uid} query={props.query} workItem={item} onUpdate={props.onUpdate} />
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid + ""}>
                    {importanceEl} {promptnessEl} {rankEl}
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell>
                <ContextMenuTrigger id={uid}>
                    {isDone && (
                        <span className="hasShelve" title={s("itemIsDone") + doneByUser}>
                            <Label color="blue" size="mini" style={{ padding: "3px 4px", marginRight: 5 }}>
                                {s("done")}
                            </Label>
                        </span>
                    )}
                    {!!item._isHasShelve && (
                        <span className="hasShelve" title={s("hasShelve")}>
                            <Label color="green" size="mini" style={{ padding: "3px 4px", marginRight: 5 }}>
                                Shelve
                            </Label>
                        </span>
                    )}
                    {getListIndicator()}
                    <span className="IterationInTitle" title={item.areaPath}>
                        {item.iterationPath}
                    </span>
                    <span>
                        {!!item._moveToProdMessage && (
                            <span className="hasShelve" title={s("moveToProd")}>
                                <Label
                                    color="teal"
                                    basic
                                    size="mini"
                                    title={item._moveToProdMessage}
                                    style={{ padding: "3px 4px", marginRight: 2 }}
                                >
                                    -&gt; Prod
                                </Label>
                            </span>
                        )}
                        {tags}
                    </span>
                    <span
                        className={"WorkItemLink " + (hasChanges ? "hasChangesText" : "")}
                        onClick={() => Platform.current.openUrl(item.url)}
                    >
                        {yellowMarkedVal("titleFull")}
                    </span>
                    {!!fullNote && (
                        <span style={{ marginLeft: 5 }} title={s("localNoteHint") + ": " + fullNote}>
                            <Label basic color={noteColor as any} size="mini" style={{ padding: "3px 4px" }}>
                                {getNote()}
                            </Label>
                        </span>
                    )}
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid}>
                    <span title={s("wiStatus") + item.state}>{getStatusIcon(item.state)}</span>
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell
                collapsing
                onDoubleClick={() => Platform.current.copyString(WorkItem.getTextName(item.assignedToFull))}
            >
                <ContextMenuTrigger id={uid}>
                    {Festival.getSpecialNameEffect(item.assignedTo, item.assignedToFull, item.assignedToImg)}
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell
                collapsing
                onDoubleClick={() => Platform.current.copyString(WorkItem.getTextName(item.createdByFull))}
            >
                <ContextMenuTrigger id={uid}>
                    {Festival.getSpecialNameEffect(item.createdBy, item.createdByFull, item.createdByImg)}
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid}>
                    {revEl} {freshnessEl}
                </ContextMenuTrigger>
            </Table.Cell>
        </Table.Row>
    );
}
