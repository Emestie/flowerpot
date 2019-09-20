import React from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { TLists } from "../helpers/Settings";
import { Menu, Icon, Confirm, Input, Radio, Label } from "semantic-ui-react";
import { IWorkItem } from "../helpers/WorkItem";
import { s } from "../values/Strings";
import Lists from "../helpers/Lists";
import Electron from "../helpers/Electron";

interface IProps {
    uid: number;
    workItem: IWorkItem;
    onUpdate: (wi: IWorkItem) => void;
}
interface IState {
    showNoteDialog: boolean;
    noteValue: string;
    colorValue: string | undefined;
}

export default class WorkItemRowContextMenu extends React.Component<IProps, IState> {
    state: IState = {
        showNoteDialog: false,
        noteValue: "",
        colorValue: undefined,
    };

    onListChange = (e: any, data: any) => {
        let list = data.list as TLists | undefined;
        let wi = this.props.workItem;

        if (list) Lists.push(list, wi.id, wi.rev);
        else if (wi.list) Lists.deleteFromList(wi.list, wi.id);

        wi.list = list;

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

    onEditNote = (e: any) => {
        Lists.setNote(this.props.workItem.id, this.state.noteValue, this.state.colorValue);
        this.setState({ showNoteDialog: false, noteValue: "", colorValue: undefined });
    };

    colorList = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "brown", "grey"];

    render() {
        let noteDialogContent = (
            <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 20 }}>{s("noteDialog")}</div>
                <div>
                    <Input
                        style={{ width: "100%" }}
                        value={this.state.noteValue}
                        onChange={e => this.setState({ noteValue: e.target.value })}
                        maxLength="50"
                    />
                </div>
                <div style={{ marginTop: 10 }}>
                    {this.colorList.map(c => (
                        <Radio
                            key={c}
                            label={
                                <Label style={{ marginRight: 10, userSelect: "none" }} circular size="small" color={c as any}>
                                    {this.state.colorValue === c ? "✔" : <span style={{ opacity: 0 }}>✔</span>}
                                </Label>
                            }
                            name="colorGrp"
                            checked={this.state.colorValue === c}
                            onChange={() => this.setState({ colorValue: c })}
                        />
                    ))}
                </div>
            </div>
        );

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
                    {wi.list && (
                        <MenuItem data={{ list: undefined }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="delete" />
                                </span>
                                {s("removeFromList")}"{s(wi.list)}"
                            </Menu.Item>
                        </MenuItem>
                    )}
                    {wi.list !== "permawatch" && (
                        <MenuItem data={{ list: "permawatch" }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="eye" />
                                </span>
                                {s("addToP")}
                            </Menu.Item>
                        </MenuItem>
                    )}
                    {wi.list !== "favorites" && (
                        <MenuItem data={{ list: "favorites" }} onClick={this.onListChange}>
                            <Menu.Item>
                                <span>
                                    <Icon name="star" />
                                </span>
                                {s("addToF")}
                            </Menu.Item>
                        </MenuItem>
                    )}
                    {wi.list !== "deferred" && (
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
                                noteValue: Lists.getNote(this.props.workItem.id) || "",
                                colorValue: Lists.getNoteColor(this.props.workItem.id),
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
                    <Confirm
                        open={this.state.showNoteDialog}
                        content={noteDialogContent}
                        onCancel={() => this.setState({ showNoteDialog: false, noteValue: "", colorValue: undefined })}
                        onConfirm={this.onEditNote}
                    />
                </Menu>
            </ContextMenu>
        );
    }
}
