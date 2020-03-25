import React from "react";
import WorkItem, { IWorkItem } from "../helpers/WorkItem";
import { Table, Icon, Label } from "semantic-ui-react";
import Electron from "../helpers/Electron";
import store from "../store";
import { observer } from "mobx-react";
import { s } from "../values/Strings";
import { ContextMenuTrigger } from "react-contextmenu";
import WorkItemRowContextMenu from "./WorkItemRowContextMenu";
import Lists from "../helpers/Lists";
import Festival from "../helpers/Festival";

interface IProps {
    item: IWorkItem;
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
        if (Lists.isIn("favorites", item.id)) return "workItemFavorite";
        if (Lists.isIn("deferred", item.id)) return "workItemDeferred";
        if (Lists.isIn("permawatch", item.id)) return "workItemPermawatch";
        if (Lists.isInText("keywords", item.titleFull)) return "workItemKeyword";
        if (item.isMine) return "workItemIsMine";
        return "workItemHasNoCanges";
    };

    get note() {
        let note = Lists.getNote(this.props.item.id);
        return note;
    }

    get noteColor() {
        let color = Lists.getNoteColor(this.props.item.id);
        return color;
    }

    getListIndocator = () => {
        let item = this.props.item;

        if (Lists.isIn("permawatch", item.id))
            return (
                <span className="wiIndicatorPermawatch">
                    <Icon name="eye" />
                </span>
            );

        if (Lists.isIn("deferred", item.id))
            return (
                <span className="wiIndicatorDeferred">
                    <Icon name="clock outline" />
                </span>
            );

        if (Lists.isIn("favorites", item.id))
            return (
                <span className="wiIndicatorFavorite">
                    <Icon name="star" />
                </span>
            );

        return undefined;
    };

    render() {
        let item = this.props.item;
        let hasChanges = store.settings.showUnreads ? store.getWIHasChanges(item) : false;
        let uid = this.props.item.id + Math.random();

        let [isDone, doneByUser] = [false, "user"];

        return (
            <Table.Row warning={this.isOrange} negative={this.isRed} onClick={this.dropChanges} className={this.getClass()}>
                <Table.Cell
                    collapsing
                    className={hasChanges ? "workItemHasCanges" : this.getClass()}
                    onDoubleClick={() => {
                        Electron.copyString(item.id.toString());
                    }}
                >
                    <ContextMenuTrigger id={uid + ""}>
                        <span title={item.type}>
                            {this.typeEl} {item.id}
                        </span>
                    </ContextMenuTrigger>

                    <WorkItemRowContextMenu uid={uid} workItem={item} onUpdate={this.props.onUpdate} />
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
                        {!!item.isHasShelve && (
                            <span className="hasShelve" title={s("hasShelve")}>
                                <Label color="green" size="mini" style={{ padding: "3px 4px", marginRight: 5 }}>
                                    Shelve
                                </Label>
                            </span>
                        )}
                        {this.getListIndocator()}
                        <span className="IterationInTitle" title={item.areaPath}>
                            {item.iterationPath}
                        </span>
                        <span className={"WorkItemLink " + (hasChanges ? "hasChangesText" : "")} onClick={() => Electron.openUrl(item.url)}>
                            {item.titleFull}
                        </span>
                        {!!this.note && (
                            <span style={{ marginLeft: 5 }} title={s("localNoteHint")}>
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
                <Table.Cell collapsing onDoubleClick={() => Electron.copyString(WorkItem.getTextName(item.assignedToFull))}>
                    <ContextMenuTrigger id={uid + ""}>{Festival.getSpecialNameEffect(item, 0)}</ContextMenuTrigger>
                </Table.Cell>
                <Table.Cell collapsing onDoubleClick={() => Electron.copyString(WorkItem.getTextName(item.createdByFull))}>
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
