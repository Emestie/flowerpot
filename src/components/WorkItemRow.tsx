import React from "react";
import { IWorkItem } from "../helpers/WorkItem";
import { Table, Popup, Icon, Label } from "semantic-ui-react";
import Electron from "../helpers/Electron";
import store from "../store";
import { observer } from "mobx-react";
import { s } from "../values/Strings";
import { ContextMenuTrigger } from "react-contextmenu";
import WorkItemRowContextMenu from "./WorkItemRowContextMenu";
import Lists from "../helpers/Lists";

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
            <Popup
                content={s("severity") + this.props.item.importanceText}
                trigger={
                    <span>
                        <Icon name="exclamation triangle" />
                        {this.props.item.importance}
                    </span>
                }
            />
        );
    }

    get promptnessEl() {
        if (!this.props.item.promptness) return undefined;
        return (
            <Popup
                content={s("priority") + this.props.item.promptnessText}
                trigger={
                    <span>
                        <Icon name="clock" />
                        {this.props.item.promptness}
                    </span>
                }
            />
        );
    }

    get rankEl() {
        if (this.props.item.rank === undefined) return undefined;
        return (
            <Popup
                content={"Rank " + this.props.item.rank}
                trigger={
                    <span>
                        <Icon name="chess queen" />
                        {this.props.item.rank}
                    </span>
                }
            />
        );
    }

    get revEl() {
        return (
            <Popup
                content={s("revision")}
                trigger={
                    <span>
                        <Icon name="redo" />
                        {this.props.item.rev}
                    </span>
                }
            />
        );
    }

    get titleEl() {
        return <Popup content={this.props.item.titleFull} trigger={<span>{this.props.item.title}</span>} />;
    }

    get freshnessEl() {
        return (
            <Popup
                content={s("timeSinceCreated") + ` (${new Date(this.props.item.createdDate).toLocaleString()})`}
                trigger={
                    <span>
                        <Icon name="leaf" />
                        {this.props.item.freshness}
                    </span>
                }
            />
        );
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
                return <span></span>;
        }
    }

    specialNameEffect(name: string, nameFull: string) {
        return <span title={nameFull}>{name}</span>;
    }

    dropChanges = () => {
        store.setWIHasChanges(this.props.item, false);
    };

    getClass = () => {
        let item = this.props.item;
        if (Lists.isIn("favorites", item.id)) return "workItemFavorite";
        if (Lists.isIn("deferred", item.id)) return "workItemDeferred";
        if (Lists.isIn("permawatch", item.id)) return "workItemPermawatch";
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
        let hasChanges = store.getWIHasChanges(item);
        let uid = this.props.item.id + Math.random();

        return (
            <Table.Row warning={this.isOrange} negative={this.isRed} onClick={this.dropChanges}>
                <Table.Cell collapsing className={hasChanges ? "workItemHasCanges" : this.getClass()}>
                    <ContextMenuTrigger id={uid + ""}>
                        {this.typeEl} {item.id}
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
                        {!!item.isHasShelve && (
                            <span className="hasShelve" title={s("hasShelve")}>
                                <Label color="green" size="mini" style={{ padding: "3px 4px", marginRight: 5 }}>
                                    Shelve
                                </Label>
                            </span>
                        )}
                        {this.getListIndocator()}
                        <span className="IterationInTitle">{item.iterationPath}</span>
                        <span className={"WorkItemLink " + (hasChanges ? "hasChangesText" : "")} onClick={() => Electron.openUrl(item.url)}>
                            {item.titleFull}
                        </span>
                        <span style={{ marginLeft: 5 }}>
                            {!!this.note && (
                                <Label color={this.noteColor as any} size="mini" style={{ padding: "3px 4px" }}>
                                    {this.note}
                                </Label>
                            )}
                        </span>
                    </ContextMenuTrigger>
                </Table.Cell>
                {this.props.isPermawatch && (
                    <Table.Cell collapsing>
                        <ContextMenuTrigger id={uid + ""}>{item.state}</ContextMenuTrigger>
                    </Table.Cell>
                )}
                <Table.Cell collapsing>
                    <ContextMenuTrigger id={uid + ""}>{this.specialNameEffect(item.assignedTo, item.assignedToFull)}</ContextMenuTrigger>
                </Table.Cell>
                <Table.Cell collapsing>
                    <ContextMenuTrigger id={uid + ""}>{this.specialNameEffect(item.createdBy, item.createdByFull)}</ContextMenuTrigger>
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
