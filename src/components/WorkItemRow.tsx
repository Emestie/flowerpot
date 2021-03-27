import React from "react";
import WorkItem, { IWorkItem } from "../helpers/WorkItem";
import { Table, Icon, Label } from "semantic-ui-react";
import Platform from "../helpers/Platform";
import store from "../store";
import { observer } from "mobx-react";
import { s } from "../values/Strings";
import { ContextMenuTrigger } from "react-contextmenu";
import WorkItemRowContextMenu from "./WorkItemRowContextMenu";
import Lists from "../helpers/Lists";
import Festival from "../helpers/Festival";
import { IQuery } from "../helpers/Query";

interface IProps {
    item: IWorkItem;
    query: IQuery;
    isPermawatch: boolean;
    onUpdate: (wi: IWorkItem) => void;
}

@observer
export default class WorkItemRow extends React.Component<IProps> {
    get isRed() {
        return this.props.item.promptness === 1 || this.props.item.rank === 1;
    }

    get isOrange() {
        return this.props.item.promptness === 2;
    }

    get importanceEl() {
        if (!this.props.item.importance) return undefined;
        return (
            <span title={s("severity") + this.props.item.importanceText}>
                <span style={{ fontSize: 12 }}>
                    <Icon name="exclamation triangle" />
                </span>
                {this.props.item.importance}
            </span>
        );
    }

    get promptnessEl() {
        if (!this.props.item.promptness) return undefined;
        return (
            <span title={s("priority") + this.props.item.promptnessText} style={{ marginLeft: 4 }}>
                <span style={{ fontSize: 12 }}>
                    <Icon name="clock" />
                </span>
                {this.props.item.promptness}
            </span>
        );
    }

    get rankEl() {
        if (this.props.item.rank === undefined) return undefined;
        return (
            <span title={"Rank " + this.props.item.rank}>
                <span style={{ fontSize: 12 }}>
                    <Icon name="chess queen" />
                </span>
                {this.props.item.rank}
            </span>
        );
    }

    get revEl() {
        return (
            <span title={s("revision")}>
                <span>
                    <Icon name="redo" />
                </span>
                {this.props.item.rev}
            </span>
        );
    }

    get freshnessEl() {
        return (
            <span title={s("timeSinceCreated") + ` (${new Date(this.props.item.createdDate).toLocaleString()})`} style={{ marginLeft: 4 }}>
                <span>
                    <Icon name="leaf" />
                </span>
                {this.props.item.freshness}
            </span>
        );
    }

    get titleEl() {
        return <span title={this.props.item.titleFull}>{this.props.item.title}</span>;
    }

    get typeEl() {
        switch (this.props.item.type) {
            case "Bug":
                return <Icon name="bug" />;
            case "Task":
                return <Icon name="check" />;
            case "Issue":
                return <Icon name="question" />;
            default:
                return <Icon name="fire" />;
        }
    }

    dropChanges = () => {
        store.setWIHasChanges(this.props.item, false);
    };

    getClass = () => {
        let item = this.props.item;
        if (Lists.isIn("favorites", this.props.query.collectionName, item.id)) return "workItemFavorite";
        if (Lists.isIn("pinned", this.props.query.collectionName, item.id)) return "workItemPinned";
        if (Lists.isIn("deferred", this.props.query.collectionName, item.id)) return "workItemDeferred";
        if (Lists.isIn("permawatch", this.props.query.collectionName, item.id)) return "workItemPermawatch";
        if (Lists.isInText("keywords", item.titleFull)) return "workItemKeyword";
        if (item._isMine) return "workItemIsMine";
        return "workItemHasNoCanges";
    };

    get note() {
        let note = this.fullNote;
        if (note && note.length > 50) {
            note = note.slice(0, 50) + "...";
        }
        return note;
    }

    get fullNote() {
        let note = Lists.getNote(this.props.item._collectionName, this.props.item.id);

        return note;
    }

    get noteColor() {
        let color = Lists.getNoteColor(this.props.item._collectionName, this.props.item.id);
        return color;
    }

    getListIndicator = () => {
        let item = this.props.item;

        if (Lists.isIn("permawatch", this.props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorPermawatch">
                    <Icon name="eye" />
                </span>
            );

        if (Lists.isIn("deferred", this.props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorDeferred">
                    <Icon name="clock outline" />
                </span>
            );

        if (Lists.isIn("favorites", this.props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorFavorite">
                    <Icon name="star" />
                </span>
            );

        if (Lists.isIn("pinned", this.props.query.collectionName, item.id))
            return (
                <span className="wiIndicatorPinned">
                    <Icon name="pin" />
                </span>
            );

        return undefined;
    };

    render() {
        const item = this.props.item;
        const hasChanges = store.settings.showUnreads ? store.getWIHasChanges(item) : false;
        const uid = this.props.item.id + Math.random();

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
                const spl = val.slice(start + xLen , start + xLen  + splitteeLength);
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
            <Table.Row warning={this.isOrange} negative={this.isRed} onClick={this.dropChanges} className={this.getClass()}>
                <Table.Cell
                    collapsing
                    className={hasChanges ? "workItemHasCanges" : this.getClass()}
                    onDoubleClick={() => {
                        Platform.current.copyString(item.id.toString());
                    }}
                >
                    <ContextMenuTrigger id={uid + ""}>
                        <span title={item.type}>
                            {this.typeEl} {yellowMarkedVal("id")}
                        </span>
                    </ContextMenuTrigger>

                    <WorkItemRowContextMenu uid={uid} query={this.props.query} workItem={item} onUpdate={this.props.onUpdate} />
                </Table.Cell>
                <Table.Cell collapsing>
                    <ContextMenuTrigger id={uid + ""}>
                        {this.importanceEl} {this.promptnessEl} {this.rankEl}
                    </ContextMenuTrigger>
                </Table.Cell>
                <Table.Cell>
                    <ContextMenuTrigger id={uid + ""}>
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
                        {this.getListIndicator()}
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
                        {!!this.note && (
                            <span style={{ marginLeft: 5 }} title={s("localNoteHint") + ": " + this.fullNote}>
                                <Label basic color={this.noteColor as any} size="mini" style={{ padding: "3px 4px" }}>
                                    {this.note}
                                </Label>
                            </span>
                        )}
                    </ContextMenuTrigger>
                </Table.Cell>
                {this.props.isPermawatch && (
                    <Table.Cell collapsing>
                        <ContextMenuTrigger id={uid + ""}>{item.state}</ContextMenuTrigger>
                    </Table.Cell>
                )}
                <Table.Cell collapsing onDoubleClick={() => Platform.current.copyString(WorkItem.getTextName(item.assignedToFull))}>
                    <ContextMenuTrigger id={uid + ""}>{Festival.getSpecialNameEffect(item, 0)}</ContextMenuTrigger>
                </Table.Cell>
                <Table.Cell collapsing onDoubleClick={() => Platform.current.copyString(WorkItem.getTextName(item.createdByFull))}>
                    <ContextMenuTrigger id={uid + ""}>{Festival.getSpecialNameEffect(item, 1)}</ContextMenuTrigger>
                </Table.Cell>
                <Table.Cell collapsing>
                    <ContextMenuTrigger id={uid + ""}>
                        {this.revEl} {this.freshnessEl}
                    </ContextMenuTrigger>
                </Table.Cell>
            </Table.Row>
        );
    }
}
