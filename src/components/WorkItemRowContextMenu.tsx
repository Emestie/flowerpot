import React from "react";
import { ContextMenu, MenuItem } from "react-contextmenu";
import { TLists } from "../helpers/Settings";
import { Menu, Icon } from "semantic-ui-react";
import { IWorkItem } from "../helpers/WorkItem";
import { s } from "../values/Strings";
import Lists from "../helpers/Lists";
import Electron from "../helpers/Electron";

interface iProps {
    uid: number;
    workItem: IWorkItem;
    onUpdate: (wi: IWorkItem) => void;
}
interface iState {}

export default class WorkItemRowContextMenu extends React.Component<iProps, iState> {
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

    render() {
        let wi = this.props.workItem;
        return (
            <ContextMenu id={this.props.uid + ""}>
                <Menu vertical>
                    <MenuItem data={{ action: "copyid" }} onClick={this.onCopyId}>
                        <Menu.Item>
                            <span>
                                <Icon name="copy outline" />
                            </span>
                            {s("copyId")}
                        </Menu.Item>
                    </MenuItem>
                    <MenuItem data={{ action: "copy" }} onClick={this.onCopy}>
                        <Menu.Item>
                            <span>
                                <Icon name="copy outline" />
                            </span>
                            {s("copy")}
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
                </Menu>
            </ContextMenu>
        );
    }
}
