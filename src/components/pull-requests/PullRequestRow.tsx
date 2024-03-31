import { useEffect, useState } from "react";
import { ContextMenuTrigger } from "react-contextmenu";
import { Icon, Label, Table } from "semantic-ui-react";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { ProfileWidget } from "../ProfileWidget";
import { Tag } from "../Tag";
import { PRReviewer } from "./PRReviewer";
import { PullRequestContextMenu } from "./PullRequestContextMenu";
import { api } from "/@/api/client";
import { IPullRequest } from "/@/modules/api-client";

interface IProps {
    pullRequest: IPullRequest;
}

export function PullRequestRow(props: IProps) {
    const { pullRequest } = props;

    const [totalComments, setTotalComments] = useState<number | null>(null);
    const [resolvedComments, setResolvedComments] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            const { resolved, total } = await api.pullRequest.getCommentsCount(pullRequest);
            setResolvedComments(resolved);
            setTotalComments(total);
        })();
    }, [pullRequest]);

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

    const commentsEl = (() => {
        if (totalComments === null) return null;

        return (
            <span title={s("prComments")} style={{ marginLeft: 4 }}>
                <span>
                    <Icon name="comments" />
                </span>
                {resolvedComments}/{totalComments}
            </span>
        );
    })();

    const tags = pullRequest.labels.map((x) => x.name).map((x, i) => <Tag key={i} text={x} />);

    const reviewers = pullRequest.reviewers
        .sort((a, b) => (a.isRequired && !b.isRequired ? -1 : 1))
        .map((rev) => <PRReviewer key={rev.uid} reviewer={rev} />);

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
                    {!!pullRequest.isDraft && (
                        <span>
                            <Label
                                key={Math.random()}
                                size="mini"
                                style={{ padding: "3px 4px", marginRight: 4 }}
                                color="grey"
                            >
                                {s("draftPullRequest")}
                            </Label>
                        </span>
                    )}
                    {pullRequest.mergeStatus === "conflicts" && (
                        <span>
                            <Label
                                key={Math.random()}
                                size="mini"
                                style={{ padding: "3px 4px", marginRight: 4 }}
                                color="red"
                            >
                                {s("prMergeConflicts")}
                            </Label>
                        </span>
                    )}
                    <span className="IterationInTitle">
                        {pullRequest.projectName}/{pullRequest.repoName}
                    </span>
                    <span>
                        <Label
                            key={Math.random()}
                            size="mini"
                            basic
                            style={{ padding: "3px 4px", marginRight: 4, color: "#689473" }}
                        >
                            {pullRequest.sourceBranch} &rarr; {pullRequest.targetBranch}
                        </Label>
                    </span>
                    <span>{tags}</span>
                    <span className={"WorkItemLink"} onClick={() => Platform.current.openUrl(pullRequest.url)}>
                        {pullRequest.title}
                    </span>
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>{reviewers}</Table.Cell>
            <Table.Cell collapsing onDoubleClick={() => Platform.current.copyString(pullRequest.getAuthorTextName())}>
                <ContextMenuTrigger id={uid}>
                    <ProfileWidget
                        avatarUrl={pullRequest.authorAvatar}
                        displayName={pullRequest.authorName}
                        nameFull={pullRequest.authorFullName}
                    />
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid}>{commentsEl}</ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid}>{freshnessEl}</ContextMenuTrigger>
            </Table.Cell>
        </Table.Row>
    );
}
