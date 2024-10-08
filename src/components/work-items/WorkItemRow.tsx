import { ContextMenuTrigger } from "react-contextmenu";
import { useDispatch, useSelector } from "react-redux";
import { Icon, Label, Table } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { Stats, UsageStat } from "../../helpers/Stats";
import { dataChangesCollectionItemSet } from "../../redux/actions/dataActions";
import { s } from "../../values/Strings";
import { HighlightenText } from "../HighlightenText";
import { ProfileWidget } from "../ProfileWidget";
import { Tag } from "../Tag";
import { WorkItemRowContextMenu } from "./WorkItemRowContextMenu";
import { Id } from "./id";
import { IterationPath } from "./iteration-path";
import { Status } from "./status";
import { IQuery, IWorkItem } from "/@/modules/api-client";
import { dataSelector } from "/@/redux/selectors/dataSelectors";
import { settingsSelector } from "/@/redux/selectors/settingsSelectors";

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

    const isRed = props.item.isRed;

    const promptnessEl = (() => {
        if (!props.item.priority) return undefined;
        return (
            <span title={props.item.priorityText} style={{ marginLeft: 4 }}>
                <span style={{ fontSize: 12 }}>
                    <Icon name="clock outline" />
                </span>
                {props.item.priority}
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

    const dropChanges = () => {
        dispatch(dataChangesCollectionItemSet(props.item, false));
    };

    const getClass = () => {
        const item = props.item;
        if (Lists.isIn("favorites", props.query.collectionName, item.id)) return "workItemFavorite";
        if (Lists.isIn("forwarded", props.query.collectionName, item.id)) return "workItemForwarded";
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

        if (Lists.isIn("forwarded", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorForwarded">
                    <Icon name="arrow right" />
                </span>
            );

        return undefined;
    };

    const item = props.item;
    const hasChanges = settings.showUnreads ? !!changesCollection[item.id] : false; //TODO: FL-11
    const uid = props.item.id + Math.random() + "";

    const tags = item.tags
        ? item.tags
              .split(";")
              .map((x) => x.trim())
              .map((x, i) => <Tag key={i} text={x} />)
        : null;

    return (
        <Table.Row negative={isRed} onClick={dropChanges} className={getClass()}>
            <Table.Cell
                collapsing
                className={"cellRelative " + getClass()}
                onDoubleClick={() => {
                    Stats.increment(UsageStat.WorkItemsInfoCopied);
                    Platform.current.copyString(item.id.toString());
                }}
            >
                <ContextMenuTrigger id={uid}>
                    <Id item={item} hasChanges={hasChanges} />
                </ContextMenuTrigger>
                <WorkItemRowContextMenu uid={uid} query={props.query} workItem={item} onUpdate={props.onUpdate} />
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid + ""}>{promptnessEl}</ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell>
                <ContextMenuTrigger id={uid}>
                    {getListIndicator()}
                    <IterationPath item={item} />
                    <span>{tags}</span>
                    <span
                        className={"WorkItemLink " + (hasChanges ? "hasChangesText" : "")}
                        onClick={() => {
                            Stats.increment(UsageStat.WorkItemsOpened);
                            Platform.current.openUrl(item.url);
                        }}
                    >
                        <HighlightenText text={item.titleFull} />
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
                    <Status workItem={item} />
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell
                collapsing
                onDoubleClick={() => {
                    Stats.increment(UsageStat.UsersNamesCopied);
                    Platform.current.copyString(item.assignedToTextName);
                }}
            >
                <ContextMenuTrigger id={uid}>
                    <ProfileWidget
                        avatarUrl={item.assignedToImg}
                        displayName={item.assignedTo}
                        nameFull={item.assignedToFull}
                    />
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell
                collapsing
                onDoubleClick={() => {
                    Stats.increment(UsageStat.UsersNamesCopied);
                    Platform.current.copyString(item.createdByTextName);
                }}
            >
                <ContextMenuTrigger id={uid}>
                    <ProfileWidget
                        avatarUrl={item.createdByImg}
                        displayName={item.createdBy}
                        nameFull={item.createdByFull}
                    />
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
