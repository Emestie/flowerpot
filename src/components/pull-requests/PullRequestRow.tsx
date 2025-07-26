import { useEffect, useState } from "react";
import { ContextMenuTrigger } from "react-contextmenu";
import { Icon, Label, Table } from "semantic-ui-react";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { ProfileWidget } from "../ProfileWidget";
import { Tag } from "../Tag";
import { PRReviewer } from "./PRReviewer";
import { PullRequestContextMenu } from "./PullRequestContextMenu";
import { getApi } from "/@/api/client";
import { IPullRequest, IPullRequestReviewer } from "/@/modules/api-client";

interface IProps {
    pullRequest: IPullRequest;
    accountId: string;
}

function createReviewersComponents(revs: IPullRequestReviewer[], accountId: string): React.ReactNode[] {
    const sortedRevs = revs.slice().sort((a, b) => (a.isRequired && !b.isRequired ? -1 : 1));

    const firstFive = sortedRevs.slice(0, 5);
    const others = sortedRevs.slice(5);

    const othersComponent =
        others.length > 0 ? (
            <span title={others.map((o) => o.name + (o.isRequired ? ` (${s("requiredReviewer")})` : "")).join("\n")}>
                +{others.length}
            </span>
        ) : (
            <></>
        );

    return firstFive
        .map((rev) => <PRReviewer key={rev.uid} accountId={accountId} reviewer={rev} />)
        .concat(othersComponent);
}

export function PullRequestRow(props: IProps) {
    const { pullRequest } = props;

    const [totalComments, setTotalComments] = useState<number | null>(null);
    const [resolvedComments, setResolvedComments] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            const { resolved, total } = await getApi(props.accountId).pullRequest.getCommentsCount(pullRequest);
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

        const commentsElIsGreen = resolvedComments === totalComments;

        return (
            <span
                title={s("prComments")}
                className={commentsElIsGreen ? "pr-comments-green" : undefined}
                style={{ marginLeft: 4 }}
            >
                <span>
                    <Icon name="comments" />
                </span>
                {resolvedComments}/{totalComments}
            </span>
        );
    })();

    const tags = pullRequest.labels.map((x) => x.name).map((x, i) => <Tag key={i} text={x} />);

    const reviewers = createReviewersComponents(pullRequest.reviewers, props.accountId);

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
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid}>{commentsEl}</ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>{reviewers}</Table.Cell>
            <Table.Cell collapsing onDoubleClick={() => Platform.current.copyString(pullRequest.getAuthorTextName())}>
                <ContextMenuTrigger id={uid}>
                    <ProfileWidget
                        accountId={props.accountId}
                        avatarUrl={pullRequest.authorAvatar}
                        displayName={pullRequest.authorName}
                        nameFull={pullRequest.authorFullName}
                    />
                </ContextMenuTrigger>
            </Table.Cell>
            <Table.Cell collapsing>
                <ContextMenuTrigger id={uid}>{freshnessEl}</ContextMenuTrigger>
            </Table.Cell>
        </Table.Row>
    );
}
