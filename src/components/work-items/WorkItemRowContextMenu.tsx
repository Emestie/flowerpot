import { useState } from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { useDispatch } from "react-redux";
import { Icon, Menu } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { TLists } from "../../helpers/Settings";
import { Stats, UsageStat } from "../../helpers/Stats";
import { appViewSet } from "../../redux/actions/appActions";
import { s } from "../../values/Strings";
import { SingleInputColorDialog } from "../dialogs/SingleInputColorDialog";
import { IQuery, IWorkItem } from "/@/modules/api-client";

interface IProps {
    uid: string;
    workItem: IWorkItem;
    query: IQuery;
    onUpdate: (wi: IWorkItem) => void;
}

export function WorkItemRowContextMenu(props: IProps) {
    const { workItem, uid, onUpdate } = props;

    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [noteInitialText, setNoteInitialText] = useState<string | undefined>(undefined);
    const [noteInitialColor, setNoteInitialColor] = useState<string | undefined>(undefined);

    const dispatch = useDispatch();

    const onListChange = (e: any, data: any) => {
        const list = data.list as TLists | undefined;
        const wi = workItem;

        if (list) {
            Lists.push(props.query.accountId, list, wi._collectionName, wi.id, wi.rev);
        } else if (wi._list) Lists.deleteFromList(props.query.accountId, wi._list, wi.id, wi._collectionName);

        if (list === "permawatch" || wi._list === "permawatch") {
            dispatch(appViewSet("refreshhelper"));
        }

        wi._list = list;

        onUpdate(wi);
    };

    const onCopy = (_: any) => {
        const wi = workItem;
        const s = `${wi.type} ${wi.id} - ${wi.iterationPath}: ${wi.title} - ${wi.url}`;

        Stats.increment(UsageStat.WorkItemsInfoCopied);
        Platform.current.copyString(s);
    };

    const onCopyId = (_: any) => {
        Stats.increment(UsageStat.WorkItemsInfoCopied);
        Platform.current.copyString(workItem.id.toString());
    };

    const onCopyUrl = (_: any) => {
        Stats.increment(UsageStat.WorkItemsInfoCopied);
        Platform.current.copyString(workItem.url);
    };

    const onEditNote = (text: string, color?: string) => {
        Lists.setNote(props.query.accountId, props.workItem._collectionName, props.workItem.id, text, color);
        setShowNoteDialog(false);
    };

    return (
        <ContextMenu id={uid}>
            <Menu vertical>
                <MenuItem data={{ action: "copy" }} onClick={onCopy}>
                    <Menu.Item>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copy")}
                    </Menu.Item>
                </MenuItem>
                <MenuItem data={{ action: "copyurl" }} onClick={onCopyUrl}>
                    <Menu.Item>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copyUrl")}
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
                {workItem._list && (
                    <MenuItem data={{ list: undefined }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="delete" />
                            </span>
                            {s("removeFromList")}"{s(workItem._list)}"
                        </Menu.Item>
                    </MenuItem>
                )}
                {workItem._list !== "permawatch" && (
                    <MenuItem data={{ list: "permawatch" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="eye" />
                            </span>
                            {s("addToP")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {workItem._list !== "pinned" && (
                    <MenuItem data={{ list: "pinned" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="pin" />
                            </span>
                            {s("addToPinned")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {workItem._list !== "favorites" && (
                    <MenuItem data={{ list: "favorites" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="star" />
                            </span>
                            {s("addToF")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {workItem._list !== "forwarded" && (
                    <MenuItem data={{ list: "forwarded" }} onClick={onListChange}>
                        <Menu.Item>
                            <span>
                                <Icon name="arrow right" />
                            </span>
                            {s("addToForwarded")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {workItem._list !== "deferred" && (
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
                        setNoteInitialText(
                            Lists.getNote(props.query.accountId, props.workItem._collectionName, props.workItem.id)
                        );
                        setNoteInitialColor(
                            Lists.getNoteColor(props.query.accountId, props.workItem._collectionName, props.workItem.id)
                        );
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
