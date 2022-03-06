import { ContextMenuTrigger } from "react-contextmenu";
import { Icon, Table } from "semantic-ui-react";
import Festival from "../../helpers/Festival";
import Platform from "../../helpers/Platform";
import { IPullRequest } from "../../helpers/PullRequest";
import WorkItem from "../../helpers/WorkItem";
import { s } from "../../values/Strings";
import { PullRequestContextMenu } from "./PullRequestContextMenu";

interface IProps {
    pullRequest: IPullRequest;
}

export function PullRequestRow(props: IProps) {
    const { pullRequest } = props;

    const uid = pullRequest.id + Math.random() + "";

    const freshnessEl = (() => {
        return (
            <span
                title={s("timeSinceCreated") + ` (${new Date(pullRequest.date).toLocaleString()})`}
                style={{ marginLeft: 4 }}
            >
                <span>
                    <Icon name="leaf" />
                </span>
                {pullRequest.freshness}
            </span>
        );
    })();

    return (
        <Table.Row>
            <Table.Cell collapsing onDoubleClick={() => Platform.current.copyString(pullRequest.id.toString())}>
                <ContextMenuTrigger id={uid}>
                    <Icon name="level up alternate" /> {pullRequest.id}
                </ContextMenuTrigger>
                <PullRequestContextMenu uid={uid} pullRequest={pullRequest} />
            </Table.Cell>
            <Table.Cell>
                <ContextMenuTrigger id={uid}>
                    <span className="IterationInTitle">
                        {pullRequest.projectName}/{pullRequest.repoName}
                    </span>
                    <span className={"WorkItemLink"} onClick={() => Platform.current.openUrl(pullRequest.url)}>
                        {pullRequest.title}
                    </span>
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell
                collapsing
                onDoubleClick={() => Platform.current.copyString(WorkItem.getTextName(pullRequest.authorFullName))}
            >
                <ContextMenuTrigger id={uid}>
                    {Festival.getSpecialNameEffect(
                        pullRequest.authorName,
                        pullRequest.authorFullName,
                        pullRequest.authorAvatar
                    )}
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid}>{freshnessEl}</ContextMenuTrigger>
            </Table.Cell>
        </Table.Row>
    );
}