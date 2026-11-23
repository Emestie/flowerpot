import { useState } from "react";
import { Icon } from "../../ui/icon";
import { Menu } from "../../ui/menu";
import { ContextMenu, type IContextMenuController } from "../../ui/context-menu";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { TLists } from "../../helpers/Settings";
import { isPermawatchQuery } from "../../helpers/permawatch";
import { Query } from "../../models/query";
import { WorkItem } from "../../models/work-item";
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

    //inside the permawatch block the only list action is leaving it: _list belongs to one instance,
    //so moving an item to another list there would leave the copy in the original query stale
    const isPermawatchBlock = isPermawatchQuery(props.query);
    //the list the item is in now, not the one cached on this instance
    const currentList = Lists.getListOf(props.query.accountId, workItem._collectionName, workItem.id);
    const listToRemove = isPermawatchBlock ? "permawatch" : currentList;

    const onListChange = (list?: TLists) => {
        const wi = workItem;

        if (list) {
            Lists.push(props.query.accountId, list, wi._collectionName, wi.id, wi.rev);
        } else if (listToRemove) Lists.deleteFromList(props.query.accountId, listToRemove, wi.id, wi._collectionName);

        //no setView("refreshhelper") here: the permawatch block follows the list itself
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
                    {listToRemove && (
                        <Menu.Item onClick={() => onListChange(undefined)}>
                            <span>
                                <Icon name="delete" />
                            </span>
                            {s("removeFromList")}"{s(listToRemove)}"
                        </Menu.Item>
                    )}
                    {!isPermawatchBlock && (
                        <>
                            {currentList !== "permawatch" && (
                                <Menu.Item onClick={() => onListChange("permawatch")}>
                                    <span>
                                        <Icon name="eye" />
                                    </span>
                                    {s("addToP")}
                                </Menu.Item>
                            )}
                            {currentList !== "pinned" && (
                                <Menu.Item onClick={() => onListChange("pinned")}>
                                    <span>
                                        <Icon name="pin" />
                                    </span>
                                    {s("addToPinned")}
                                </Menu.Item>
                            )}
                            {currentList !== "favorites" && (
                                <Menu.Item onClick={() => onListChange("favorites")}>
                                    <span>
                                        <Icon name="star" />
                                    </span>
                                    {s("addToF")}
                                </Menu.Item>
                            )}
                            {currentList !== "forwarded" && (
                                <Menu.Item onClick={() => onListChange("forwarded")}>
                                    <span>
                                        <Icon name="arrow right" />
                                    </span>
                                    {s("addToForwarded")}
                                </Menu.Item>
                            )}
                            {currentList !== "deferred" && (
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
                        </>
                    )}
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
