import { useState } from "react";
import { Icon } from "../../ui/icon";
import { Menu } from "../../ui/menu";
import { ContextMenu, type IContextMenuController } from "../../ui/context-menu";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { TLists } from "../../helpers/Settings";
import { Query } from "../../models/query";
import { WorkItem } from "../../models/work-item";
import { useAppStore } from "../../zustand/app";
import { s } from "../../values/Strings";
import { SingleInputColorDialog } from "../dialogs/SingleInputColorDialog";

interface IProps {
    menu: IContextMenuController;
    workItem: WorkItem;
    query: Query;
    onUpdate: (wi: WorkItem) => void;
}

export function WorkItemRowContextMenu(props: IProps) {
    const { workItem, menu, onUpdate } = props;

    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [noteInitialText, setNoteInitialText] = useState<string | undefined>(undefined);
    const [noteInitialColor, setNoteInitialColor] = useState<string | undefined>(undefined);

    const setView = useAppStore((s) => s.setView);

    const onListChange = (list?: TLists) => {
        const wi = workItem;

        if (list) {
            Lists.push(props.query.accountId, list, wi._collectionName, wi.id, wi.rev);
        } else if (wi._list) Lists.deleteFromList(props.query.accountId, wi._list, wi.id, wi._collectionName);

        if (list === "permawatch" || wi._list === "permawatch") {
            setView("refreshhelper");
        }

        wi._list = list;

        onUpdate(wi);
    };

    const onCopy = () => {
        const wi = workItem;
        const text = `${wi.type} ${wi.id} - ${wi.iterationPath}: ${wi.title} - ${wi.url}`;

        Platform.current.copyString(text);
    };

    const onCopyId = () => {
        Platform.current.copyString(workItem.id.toString());
    };

    const onCopyUrl = () => {
        Platform.current.copyString(workItem.url);
    };

    const onOpenNote = () => {
        setNoteInitialText(Lists.getNote(props.query.accountId, props.workItem._collectionName, props.workItem.id));
        setNoteInitialColor(
            Lists.getNoteColor(props.query.accountId, props.workItem._collectionName, props.workItem.id)
        );
        setShowNoteDialog(true);
    };

    const onEditNote = (text: string, color?: string) => {
        Lists.setNote(props.query.accountId, props.workItem._collectionName, props.workItem.id, text, color);
        setShowNoteDialog(false);
    };

    return (
        <>
            <ContextMenu controller={menu}>
                <Menu vertical secondary>
                    <Menu.Item onClick={onCopy}>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copy")}
                    </Menu.Item>
                    <Menu.Item onClick={onCopyUrl}>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copyUrl")}
                    </Menu.Item>
                    <Menu.Item onClick={onCopyId}>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copyId")}
                    </Menu.Item>
                    {workItem._list && (
                        <Menu.Item onClick={() => onListChange(undefined)}>
                            <span>
                                <Icon name="delete" />
                            </span>
                            {s("removeFromList")}"{s(workItem._list)}"
                        </Menu.Item>
                    )}
                    {workItem._list !== "permawatch" && (
                        <Menu.Item onClick={() => onListChange("permawatch")}>
                            <span>
                                <Icon name="eye" />
                            </span>
                            {s("addToP")}
                        </Menu.Item>
                    )}
                    {workItem._list !== "pinned" && (
                        <Menu.Item onClick={() => onListChange("pinned")}>
                            <span>
                                <Icon name="pin" />
                            </span>
                            {s("addToPinned")}
                        </Menu.Item>
                    )}
                    {workItem._list !== "favorites" && (
                        <Menu.Item onClick={() => onListChange("favorites")}>
                            <span>
                                <Icon name="star" />
                            </span>
                            {s("addToF")}
                        </Menu.Item>
                    )}
                    {workItem._list !== "forwarded" && (
                        <Menu.Item onClick={() => onListChange("forwarded")}>
                            <span>
                                <Icon name="arrow right" />
                            </span>
                            {s("addToForwarded")}
                        </Menu.Item>
                    )}
                    {workItem._list !== "deferred" && (
                        <Menu.Item onClick={() => onListChange("deferred")}>
                            <span>
                                <Icon name="clock outline" />
                            </span>
                            {s("addToD")}
                        </Menu.Item>
                    )}
                    <Menu.Item onClick={() => onListChange("hidden")}>
                        <span>
                            <Icon name="eye slash outline" />
                        </span>
                        {s("addToH")}
                    </Menu.Item>
                    <Menu.Item onClick={onOpenNote}>
                        <span>
                            <Icon name="text cursor" />
                        </span>
                        {s("noteCommand")}
                    </Menu.Item>
                </Menu>
            </ContextMenu>
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
        </>
    );
}
