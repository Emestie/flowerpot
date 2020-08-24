import React from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { TLists } from "../helpers/Settings";
import { Menu, Icon } from "semantic-ui-react";
import { IWorkItem } from "../helpers/WorkItem";
import { s } from "../values/Strings";
import Lists from "../helpers/Lists";
import Electron from "../helpers/Electron";
import SingleInputColorDialog from "./SingleInputColorDialog";
import { IQuery } from "../helpers/Query";
import store from "../store";

interface IProps {
    uid: number;
    workItem: IWorkItem;
    query: IQuery;
    onUpdate: (wi: IWorkItem) => void;
}
interface IState {
    showNoteDialog: boolean;
    noteInitialText: string | undefined;
    noteInitialColor: string | undefined;
}

export default class WorkItemRowContextMenu extends React.Component<IProps, IState> {
    state: IState = {
        showNoteDialog: false,
        noteInitialText: undefined,
        noteInitialColor: undefined,
    };

    onListChange = (e: any, data: any) => {
        let list = data.list as TLists | undefined;
        let wi = this.props.workItem;

        if (list) {
            Lists.push(list, wi._collectionName, wi.id, wi.rev);
        } else if (wi._list) Lists.deleteFromList(wi._list, wi.id, wi._collectionName);

        if (list === "permawatch" || wi._list === "permawatch") {
            store.switchView("refreshhelper");
        }

        wi._list = list;

        this.props.onUpdate(wi);
    };

    onCopy = (e: any) => {
        let wi = this.props.workItem;
        let s = `${wi.type} ${wi.id} - ${wi.iterationPath}: ${wi.title} (${wi.url})`;

        Electron.copyString(s);
    };

    onCopyId = (e: any) => {
        let wi = this.props.workItem;
        let s = `${wi.id}`;

        Electron.copyString(s);
    };

    onEditNote = (text: string, color?: string) => {
        Lists.setNote(this.props.workItem.id, text, color);
        this.setState({ showNoteDialog: false });
    };

    render() {
        let wi = this.props.workItem;
        return (
            <ContextMenu id={this.props.uid + ""}>
                <Menu vertical>
                    <MenuItem data={{ action: "copy" }} onClick={this.onCopy}>
                        <Menu.Item>
                            <span>
                                <Icon name="copy outline" />
                            </span>
                            {s("copy")}
                        </Menu.Item>
                    </MenuItem>
                    <MenuItem data={{ action: "copyid" }} onClick={this.onCopyId}>
                        <Menu.Item>
                            <span>
                                <Icon name="copy outline" />
                            </span>
                            {s("copyId")}
                        </Menu.Item>
                    </MenuItem>
                    {wi._list && (
                        <MenuItem data={{ list: undefined }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="delete" />
                                </span>
                                {s("removeFromList")}"{s(wi._list)}"
                            </Menu.Item>
                        </MenuItem>
                    )}
                    {wi._list !== "permawatch" && (
                        <MenuItem data={{ list: "permawatch" }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="eye" />
                                </span>
                                {s("addToP")}
                            </Menu.Item>
                        </MenuItem>
                    )}
                    {wi._list !== "pinned" && (
                        <MenuItem data={{ list: "pinned" }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="pin" />
                                </span>
                                {s("addToPinned")}
                            </Menu.Item>
                        </MenuItem>
                    )}
                    {wi._list !== "favorites" && (
                        <MenuItem data={{ list: "favorites" }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="star" />
                                </span>
                                {s("addToF")}
                            </Menu.Item>
                        </MenuItem>
                    )}
                    {wi._list !== "deferred" && (
                        <MenuItem data={{ list: "deferred" }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="clock outline" />
                                </span>
                                {s("addToD")}
                            </Menu.Item>
                        </MenuItem>
                    )}
                    <MenuItem data={{ list: "hidden" }} onClick={this.onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="eye slash outline" />
                            </span>
                            {s("addToH")}
                        </Menu.Item>
                    </MenuItem>
                    <MenuItem
                        data={{ action: "note" }}
                        onClick={() =>
                            this.setState({
                                showNoteDialog: true,
                                noteInitialText: Lists.getNote(this.props.workItem.id),
                                noteInitialColor: Lists.getNoteColor(this.props.workItem.id),
                            })
                        }
                    >
                        <Menu.Item>
                            <span>
                                <Icon name="text cursor" />
                            </span>
                            {s("noteCommand")}
                        </Menu.Item>
                    </MenuItem>
                    <SingleInputColorDialog
                        show={this.state.showNoteDialog}
                        caption={s("noteDialog")}
                        onClose={() => this.setState({ showNoteDialog: false })}
                        onOk={this.onEditNote}
                        initialText={this.state.noteInitialText}
                        initialColor={this.state.noteInitialColor}
                        basic
                        showColors
                        area
                    />
                </Menu>
            </ContextMenu>
        );
    }
}
