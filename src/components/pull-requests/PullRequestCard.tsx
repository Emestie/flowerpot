import { MouseEvent, useState, useEffect } from "react";
import { ReactNode } from "react";
import { showMenu } from "react-contextmenu";
import { Label } from "../../ui/label";
import { Icon } from "../../ui/icon";
import { Card } from "../../ui/card";
import Platform from "../../helpers/Platform";
import { PullRequest } from "../../models/pull-request";
import { PullRequestReviewer } from "../../models/pull-request-reviewer";
import { s } from "../../values/Strings";
import { Link } from "../Link";
import { HighlightenText } from "../HighlightenText";
import { ProfileWidget } from "../profile-widget/profile-widget";
import { Tag } from "../Tag";
import { PRReviewer } from "./pr-reviewer/pr-reviewer";
import { PullRequestContextMenu } from "./PullRequestContextMenu";
import { getApi } from "../../api/client";
import { useDataStore } from "../../zustand/data";
import { useSettingsStore } from "../../zustand/settings";

interface IProps {
    pullRequest: PullRequest;
    accountId: string;
}

function createReviewersComponents(revs: PullRequestReviewer[], accountId: string): ReactNode[] {
    const sortedRevs = revs.slice().sort((a, b) => (a.isRequired && !b.isRequired ? -1 : 1));

    const firstFive = sortedRevs.slice(0, 5);
    const others = sortedRevs.slice(5);

    const result: ReactNode[] = firstFive.map((rev) => (
        <PRReviewer key={rev.uid} accountId={accountId} reviewer={rev} />
    ));

    if (others.length > 0) {
        result.push(
            <span
                key="othcmp"
                title={others.map((o) => o.name + (o.isRequired ? ` (${s("requiredReviewer")})` : "")).join("\n")}
            >
                +{others.length}
            </span>
        );
    }

    return result;
}

export function PullRequestCard(props: IProps) {
    const { pullRequest } = props;
    const prChangesCollection = useDataStore((state) => state.prChangesCollection);
    const showUnreads = useSettingsStore((state) => state.showUnreads);

    const hasChanges = showUnreads && !!prChangesCollection[pullRequest.id];

    const [totalComments, setTotalComments] = useState<number | null>(null);
    const [resolvedComments, setResolvedComments] = useState<number | null>(null);

    const { collectionName, projectName, repoId, id } = pullRequest;
    const { accountId } = props;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { resolved, total } = await getApi(accountId).pullRequest.getCommentsCount(pullRequest);
            if (!cancelled) {
                setResolvedComments(resolved);
                setTotalComments(total);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [accountId, collectionName, projectName, repoId, id]);

    const [uid] = useState(() => `${pullRequest.repoId}-${pullRequest.id}-${Math.random().toString(36).slice(2)}`);

    const openMenu = (e: MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        showMenu({ position: { x: rect.left, y: rect.bottom }, id: uid });
    };

    const freshnessEl = (() => {
        return (
            <span title={s("timeSinceCreated") + ` (${new Date(pullRequest.date).toLocaleString()})`} className="ml-4">
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
                className={commentsElIsGreen ? "pr-comments-green pr-comments" : "pr-comments"}
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
    const rowStyle = hasChanges ? { fontWeight: "bold" as const } : undefined;

    const dropChanges = () => {
        useDataStore.getState().setPrChangesCollectionItem(pullRequest, false);
    };

    const handleClick = () => {
        if (hasChanges) {
            dropChanges();
        }
    };

    const cardClassName = ["pr-card", pullRequest.isHidden() ? "workItemDeferred" : ""].filter(Boolean).join(" ");

    return (
        <Card className={cardClassName} onClick={handleClick} onContextMenu={(e) => e.preventDefault()} wide>
            <Card.Content className="pr-card-header">
                <span
                    className={
                        "pr-card-id " + (pullRequest.isHidden() ? "cellRelative workItemDeferred" : "cellRelative")
                    }
                    style={rowStyle}
                    onDoubleClick={() => Platform.current.copyString(pullRequest.id.toString())}
                >
                    {pullRequest.newThreadsCount > 0 && (
                        <span className="PrUnreadDot" title={s("unreadPrHint")}>
                            {pullRequest.newThreadsCount > 99 ? "99" : pullRequest.newThreadsCount}
                        </span>
                    )}
                    {hasChanges && <span title={s("newItem")} className="HasChangesDot"></span>}
                    <Icon name="level up alternate" />{" "}
                    <HighlightenText text={pullRequest.id.toString()} />
                </span>
                <span className="pr-card-meta">
                    {!!pullRequest.isDraft && (
                        <Label key="draft" size="mini" className="mr-4" color="grey">
                            {s("draftPullRequest")}
                        </Label>
                    )}
                    {pullRequest.mergeStatus === "conflicts" && (
                        <Label key="conflicts" size="mini" className="mr-4" color="red">
                            {s("prMergeConflicts")}
                        </Label>
                    )}
                    {commentsEl}
                    <span className="card-menu-btn" title={s("actions")} onClick={openMenu}>
                        <Icon name="ellipsis vertical" fitted />
                    </span>
                </span>
            </Card.Content>
            <Card.Content className="pr-card-content">
                <span className="pr-card-iteration" style={rowStyle}>
                    {pullRequest.isHidden() && (
                        <span className="wiIndicatorDeferred">
                            <Icon name="eye slash" />
                        </span>
                    )}
                    <span className="IterationInTitle">
                        {pullRequest.projectName}/{pullRequest.repoName}
                    </span>
                    <span>
                        <Label
                            key="branch"
                            size="mini"
                            basic
                            className="mr-4"
                            style={{ color: "var(--pr-branch-label-color, #689473)" }}
                        >
                            {pullRequest.sourceBranch} &rarr; {pullRequest.targetBranch}
                        </Label>
                    </span>
                </span>
                <span>{tags}</span>
                <span style={rowStyle}>
                    <Link className="WorkItemLink" href={pullRequest.url}>
                        <HighlightenText text={pullRequest.title} />
                    </Link>
                </span>
            </Card.Content>
            <Card.Content className="pr-card-footer">
                <span>{reviewers}</span>
                <span className="pr-card-footer-right">
                    <ProfileWidget
                        accountId={props.accountId}
                        avatarUrl={pullRequest.authorAvatar}
                        displayName={pullRequest.authorName}
                        nameFull={pullRequest.authorFullName}
                    />
                    {freshnessEl}
                </span>
            </Card.Content>
            <PullRequestContextMenu uid={uid} pullRequest={pullRequest} />
        </Card>
    );
}
