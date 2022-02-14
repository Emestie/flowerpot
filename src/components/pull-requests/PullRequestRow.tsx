import { Icon, Table } from "semantic-ui-react";
import Festival from "../../helpers/Festival";
import Platform from "../../helpers/Platform";
import { IPullRequest } from "../../helpers/PullRequest";
import { s } from "../../values/Strings";

interface IProps {
    pullRequest: IPullRequest;
}

export function PullRequestRow(props: IProps) {
    const { pullRequest } = props;

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
            <Table.Cell collapsing>
                <Icon name="level up alternate" /> {pullRequest.id}
            </Table.Cell>
            <Table.Cell>
                <span className="IterationInTitle">
                    {pullRequest.projectName}/{pullRequest.repoName}
                </span>
                <span className={"WorkItemLink"} onClick={() => Platform.current.openUrl(pullRequest.url)}>
                    {pullRequest.title}
                </span>
            </Table.Cell>
            <Table.Cell collapsing>
                {Festival.getSpecialNameEffect(
                    pullRequest.authorName,
                    pullRequest.authorFullName,
                    pullRequest.authorAvatar
                )}
            </Table.Cell>
            <Table.Cell collapsing>{freshnessEl}</Table.Cell>
        </Table.Row>
    );
}
