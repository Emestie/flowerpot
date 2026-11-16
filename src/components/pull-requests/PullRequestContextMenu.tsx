import { Icon } from "../../ui/icon";
import { Menu } from "../../ui/menu";
import { ContextMenu, type IContextMenuController } from "../../ui/context-menu";
import Lists from "../../helpers/Lists";
import Platform from "../../helpers/Platform";
import { PullRequest } from "../../models/pull-request";
import { s } from "../../values/Strings";

interface IProps {
    menu: IContextMenuController;
    pullRequest: PullRequest;
}

export function PullRequestContextMenu(props: IProps) {
    const { pullRequest, menu } = props;

    const isHidden = pullRequest.isHidden();

    const onCopy = () => {
        const pr = pullRequest;
        const text = `PR #${pr.id} - ${pr.projectName}/${pr.repoName}: ${pr.title} - ${pr.url}`;
        Platform.current.copyString(text);
    };

    const onCopyId = () => {
        Platform.current.copyString(pullRequest.id.toString());
    };

    const onCopyUrl = () => {
        Platform.current.copyString(pullRequest.url);
    };

    const onHide = () => {
        Lists.setPrAsHidden(pullRequest.accountId, pullRequest.collectionName, pullRequest.id);
    };

    const onUnhide = () => {
        Lists.removePrFromHidden(pullRequest.accountId, pullRequest.collectionName, pullRequest.id);
    };

    return (
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
                {!isHidden && (
                    <Menu.Item onClick={onHide}>
                        <span>
                            <Icon name="eye slash outline" />
                        </span>
                        {s("hidePr")}
                    </Menu.Item>
                )}
                {!!isHidden && (
                    <Menu.Item onClick={onUnhide}>
                        <span>
                            <Icon name="eye" />
                        </span>
                        {s("unhidePr")}
                    </Menu.Item>
                )}
            </Menu>
        </ContextMenu>
    );
}
