import { ContextMenu, MenuItem } from "react-contextmenu";
import { Icon, Menu } from "semantic-ui-react";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { IPullRequest } from "/@/modules/api-client";

interface IProps {
    uid: string;
    pullRequest: IPullRequest;
}

export function PullRequestContextMenu(props: IProps) {
    const { pullRequest, uid } = props;

    const isHidden = pullRequest.isHidden();

    const onCopy = (_: any) => {
        const pr = pullRequest;
        const s = `PR #${pr.id} - ${pr.projectName}/${pr.repoName}: ${pr.title} - ${pr.url}`;
        Platform.current.copyString(s);
    };

    const onCopyId = (_: any) => {
        Platform.current.copyString(pullRequest.id.toString());
    };

    const onCopyUrl = (_: any) => {
        Platform.current.copyString(pullRequest.url);
    };

    const onHide = () => {
        Lists.setPrAsHidden(pullRequest.accountId, pullRequest.collectionName, pullRequest.id);
    };

    const onUnhide = () => {
        Lists.removePrFromHidden(pullRequest.accountId, pullRequest.collectionName, pullRequest.id);
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
                {!isHidden && (
                    <MenuItem data={{ action: "hide" }} onClick={onHide}>
                        <Menu.Item>
                            <span>
                                <Icon name="eye slash outline" />
                            </span>
                            {s("hidePr")}
                        </Menu.Item>
                    </MenuItem>
                )}
                {!!isHidden && (
                    <MenuItem data={{ action: "unhide" }} onClick={onUnhide}>
                        <Menu.Item>
                            <span>
                                <Icon name="eye" />
                            </span>
                            {s("unhidePr")}
                        </Menu.Item>
                    </MenuItem>
                )}
            </Menu>
        </ContextMenu>
    );
}
