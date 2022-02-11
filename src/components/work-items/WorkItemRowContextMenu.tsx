import React, { useState } from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { useDispatch } from "react-redux";
import { Menu, Icon } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { IQuery } from "../../helpers/Query";
import { TLists } from "../../helpers/Settings";
import { IWorkItem } from "../../helpers/WorkItem";
import { appViewSet } from "../../redux/actions/appActions";
import { s } from "../../values/Strings";
import { SingleInputColorDialog } from "../dialogs/SingleInputColorDialog";

interface IProps {
    uid: number;
    workItem: IWorkItem;
    query: IQuery;
    onUpdate: (wi: IWorkItem) => void;
}

export function WorkItemRowContextMenu(props: IProps) {
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [noteInitialText, setNoteInitialText] = useState<string | undefined>(undefined);
    const [noteInitialColor, setNoteInitialColor] = useState<string | undefined>(undefined);

    const dispatch = useDispatch();

    const onListChange = (e: any, data: any) => {
        let list = data.list as TLists | undefined;
        let wi = props.workItem;

        if (list) {
            Lists.push(list, wi._collectionName, wi.id, wi.rev);
        } else if (wi._list) Lists.deleteFromList(wi._list, wi.id, wi._collectionName);

        if (list === "permawatch" || wi._list === "permawatch") {
            dispatch(appViewSet("refreshhelper"));
        }

        wi._list = list;

        props.onUpdate(wi);
    };

    const onCopy = (e: any) => {
        let wi = props.workItem;
        let s = `${wi.type} ${wi.id} - ${wi.iterationPath}: ${wi.title} (${wi.url})`;

        Platform.current.copyString(s);
    };

    const onCopyId = (e: any) => {
        let wi = props.workItem;
        let s = `${wi.id}`;

        Platform.current.copyString(s);
    };

    const onEditNote = (text: string, color?: string) => {
        Lists.setNote(props.workItem._collectionName, props.workItem.id, text, color);
        setShowNoteDialog(false);
    };

    let wi = props.workItem;
    return (
        <ContextMenu id={props.uid + ""}>
            <Menu vertical>
                <MenuItem data={{ action: "copy" }} onClick={onCopy}>
                    <Menu.Item>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copy")}
                    </Menu.Item>
                </MenuItem>
                <MenuItem data={{ action: "copyid" }} onClick={onCopyId}>
                    <Menu.Item>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copyId")}
                    </Menu.Item>
                </MenuItem>
                {wi._list && (
                    <MenuItem data={{ list: undefined }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="delete" />
                            </span>
                            {s("removeFromList")}"{s(wi._list)}"
                        </Menu.Item>
                    </MenuItem>
                )}
                {wi._list !== "permawatch" && (
                    <MenuItem data={{ list: "permawatch" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="eye" />
                            </span>
                            {s("addToP")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {wi._list !== "pinned" && (
                    <MenuItem data={{ list: "pinned" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="pin" />
                            </span>
                            {s("addToPinned")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {wi._list !== "favorites" && (
                    <MenuItem data={{ list: "favorites" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="star" />
                            </span>
                            {s("addToF")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {wi._list !== "deferred" && (
                    <MenuItem data={{ list: "deferred" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="clock outline" />
                            </span>
                            {s("addToD")}
                        </Menu.Item>
                    </MenuItem>
                )}
                <MenuItem data={{ list: "hidden" }} onClick={onListChange}>
                    <Menu.Item>
                        <span>
                            <Icon name="eye slash outline" />
                        </span>
                        {s("addToH")}
                    </Menu.Item>
                </MenuItem>
                <MenuItem
                    data={{ action: "note" }}
                    onClick={() => {
                        setShowNoteDialog(true);
                        setNoteInitialText(Lists.getNote(props.workItem._collectionName, props.workItem.id));
                        setNoteInitialColor(Lists.getNoteColor(props.workItem._collectionName, props.workItem.id));
                    }}
                >
                    <Menu.Item>
                        <span>
                            <Icon name="text cursor" />
                        </span>
                        {s("noteCommand")}
                    </Menu.Item>
                </MenuItem>
                <SingleInputColorDialog
                    show={showNoteDialog}
                    caption={s("noteDialog")}
                    onClose={() => setShowNoteDialog(false)}
                    onOk={onEditNote}
                    initialText={noteInitialText}
                    initialColor={noteInitialColor}
                    basic
                    showColors
                    area
                />
            </Menu>
        </ContextMenu>
    );
}
