import { ContextMenu, MenuItem } from "react-contextmenu";
import { Icon, Menu } from "semantic-ui-react";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { IPullRequest } from "/@/modules/api-client";

interface IProps {
    uid: string;
    pullRequest: IPullRequest;
}

export function PullRequestContextMenu(props: IProps) {
    const { pullRequest, uid } = props;

    const onCopy = (_: any) => {
        const pr = pullRequest;
        const s = `PR #${pr.id} - ${pr.projectName}/${pr.repoName}: ${pr.title} (${pr.url})`;
        Platform.current.copyString(s);
    };

    const onCopyId = (_: any) => {
        Platform.current.copyString(pullRequest.id.toString());
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
                <MenuItem data={{ action: "copyid" }} onClick={onCopyId}>
                    <Menu.Item>
                        <span>
                            <Icon name="copy outline" />
                        </span>
                        {s("copyId")}
                    </Menu.Item>
                </MenuItem>
            </Menu>
        </ContextMenu>
    );
}
