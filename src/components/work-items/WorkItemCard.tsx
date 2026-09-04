import { ContextMenuTrigger } from "react-contextmenu";
import { Label, type TColor } from "../../ui/label";
import { Icon } from "../../ui/icon";
import { Card } from "../../ui/card";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { Query } from "../../models/query";
import { WorkItem } from "../../models/work-item";
import { s } from "../../values/Strings";
import { HighlightenText } from "../HighlightenText";
import { Link } from "../Link";
import { ProfileWidget } from "../profile-widget/profile-widget";
import { Tag } from "../Tag";
import { WorkItemRowContextMenu } from "./WorkItemRowContextMenu";
import { Id } from "./id";
import { IterationPath } from "./iteration-path";
import { Status } from "./status";
import { useDataStore } from "../../zustand/data";
import { useSettingsStore } from "../../zustand/settings";

interface IProps {
    item: WorkItem;
    query: Query;
    isPermawatch: boolean;
    onUpdate: (wi: WorkItem) => void;
}

export function WorkItemCard(props: IProps) {
    const showUnreads = useSettingsStore((state) => state.showUnreads);
    const changesCollection = useDataStore((state) => state.changesCollection);
    const setChangesCollectionItem = useDataStore((state) => state.setChangesCollectionItem);

    const isRed = props.item.isRed;

    const promptnessEl = (() => {
        if (!props.item.priority) return undefined;
        return (
            <span title={props.item.priorityText} className="wi-promptness">
                <span className="font-sm">
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
                className="wi-freshness"
            >
                <span>
                    <Icon name="leaf" />
                </span>
                {props.item.freshness}
            </span>
        );
    })();

    const dropChanges = () => {
        setChangesCollectionItem(props.item, false);
    };

    const getClass = () => {
        const item = props.item;
        if (Lists.isIn(props.query.accountId, "favorites", props.query.collectionName, item.id))
            return "workItemFavorite";
        if (Lists.isIn(props.query.accountId, "forwarded", props.query.collectionName, item.id))
            return "workItemForwarded";
        if (Lists.isIn(props.query.accountId, "pinned", props.query.collectionName, item.id)) return "workItemPinned";
        if (Lists.isIn(props.query.accountId, "deferred", props.query.collectionName, item.id))
            return "workItemDeferred";
        if (Lists.isIn(props.query.accountId, "permawatch", props.query.collectionName, item.id))
            return "workItemPermawatch";
        if (Lists.isInText(props.query.accountId, "keywords", item.titleFull)) return "workItemKeyword";
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
        let note = Lists.getNote(props.query.accountId, props.item._collectionName, props.item.id);
        return note;
    })();

    const noteColor = (() => {
        let color = Lists.getNoteColor(props.query.accountId, props.item._collectionName, props.item.id);
        return color;
    })();

    const getListIndicator = () => {
        let item = props.item;

        if (Lists.isIn(props.query.accountId, "permawatch", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorPermawatch" title={s("addToP")}>
                    <Icon name="eye" />
                </span>
            );

        if (Lists.isIn(props.query.accountId, "deferred", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorDeferred" title={s("addToD")}>
                    <Icon name="clock outline" />
                </span>
            );

        if (Lists.isIn(props.query.accountId, "favorites", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorFavorite" title={s("addToF")}>
                    <Icon name="star" />
                </span>
            );

        if (Lists.isIn(props.query.accountId, "pinned", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorPinned" title={s("addToPinned")}>
                    <Icon name="pin" />
                </span>
            );

        if (Lists.isIn(props.query.accountId, "forwarded", props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorForwarded" title={s("addToForwarded")}>
                    <Icon name="arrow right" />
                </span>
            );

        return undefined;
    };

    const item = props.item;
    const hasChanges = showUnreads ? !!changesCollection[item.id] : false;
    const uid = props.item.id + Math.random() + "";

    const tags = item.tags
        ? item.tags
              .split(";")
              .map((x) => x.trim())
              .map((x, i) => <Tag key={i} text={x} />)
        : null;

    const cardClassName = ["wi-card", getClass(), isRed ? "negative" : ""].filter(Boolean).join(" ");

    return (
        <Card className={cardClassName} onClick={dropChanges} wide>
            <ContextMenuTrigger id={uid}>
                <Card.Content className="wi-card-header">
                    <span className="wi-card-id">
                        <span
                            onDoubleClick={() => {
                                Platform.current.copyString(item.id.toString());
                            }}
                        >
                            <Id item={item} hasChanges={hasChanges} />
                        </span>
                        {promptnessEl}
                    </span>
                    <Status workItem={item} query={props.query} onUpdate={props.onUpdate} />
                </Card.Content>
                <Card.Content>
                    <span className="wi-card-list-indicator">{getListIndicator()}</span>
                    <span className="wi-card-iteration">
                        <IterationPath item={item} />
                        <span title={item.requestNumber}>
                            {item.requestNumber ? <Icon name="phone volume" /> : <></>}
                        </span>
                    </span>
                    <span>{tags}</span>
                    <Link className={"WorkItemLink " + (hasChanges ? "hasChangesText" : "")} href={item.url}>
                        <HighlightenText text={item.titleFull} />
                    </Link>
                    {!!fullNote && (
                        <span className="wi-note-wrapper" title={s("localNoteHint") + ": " + fullNote}>
                            <Label basic color={noteColor as TColor} size="mini">
                                {getNote()}
                            </Label>
                        </span>
                    )}
                </Card.Content>
                <Card.Content className="wi-card-footer">
                    <span className="dual-container">
                        <span className="dual-part-half">
                            <ProfileWidget
                                accountId={props.query.accountId}
                                avatarUrl={item.assignedToImg}
                                displayName={item.assignedTo}
                                nameFull={item.assignedToFull}
                                copyName={item.assignedToTextName}
                            />
                        </span>
                        <span className="dual-part-half">
                            <ProfileWidget
                                accountId={props.query.accountId}
                                avatarUrl={item.createdByImg}
                                displayName={item.createdBy}
                                nameFull={item.createdByFull}
                                copyName={item.createdByTextName}
                            />
                        </span>
                    </span>
                    <span className="wi-card-meta">
                        {revEl} {freshnessEl}
                    </span>
                </Card.Content>
            </ContextMenuTrigger>
            <WorkItemRowContextMenu uid={uid} query={props.query} workItem={item} onUpdate={props.onUpdate} />
        </Card>
    );
}
