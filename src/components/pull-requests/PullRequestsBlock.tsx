import { useMemo } from "react";
import { Icon, Message, Table } from "semantic-ui-react";
import { usePullRequestsLoader } from "../../hooks/usePullRequestsLoader";
import { s } from "../../values/Strings";
import { CollapsibleBlock } from "../CollapsibleBlock";
import { FilterToggleButton } from "../FilterToggleButton";
import { PullRequestRow } from "./PullRequestRow";
import { useSettingsStore } from "../../zustand/settings";

export function PullRequestsBlock(props: { accountId: string }) {
    const {
        projects: _allProjects,
        tableScale,
        includeTeamsPRs,
        includeAcceptedByMePRs,
        includeHiddenPRs,
        showEmptyQueries,
    } = useSettingsStore();
    const setIncludeHiddenPRs = useSettingsStore((state) => state.setIncludeHiddenPRs);
    const setIncludeTeamsPRs = useSettingsStore((state) => state.setIncludeTeamsPRs);
    const setIncludeAcceptedByMePRs = useSettingsStore((state) => state.setIncludeAcceptedByMePRs);

    const projects = useMemo(() => _allProjects.filter((x) => x.accountId === props.accountId), []);

    const {
        isLoading,
        pullRequests,
        routineStart,
        errorMessage,
        hasTeams,
        hasAcceptedByMe,
        hasHidden,
        allPullRequests,
    } = usePullRequestsLoader(props.accountId, projects, includeTeamsPRs, includeAcceptedByMePRs, includeHiddenPRs);

    if (!projects.filter((p) => p.enabled).length) return null;

    const totalItemsCount = pullRequests.length;
    const totalTeamsCount = pullRequests.filter((x) => x.getBelonging() === "team").length;
    const totalHiddenCount = pullRequests.filter((x) => x.isHidden()).length;

    const refreshBlock = () => {
        if (!isLoading) routineStart();
    };

    const getTableSize = () => {
        return tableScale === 1 ? undefined : tableScale === 2 ? "large" : "small";
    };

    const pullRequestsComponents = pullRequests.map((pr) => (
        <PullRequestRow key={pr.id} pullRequest={pr} accountId={props.accountId} />
    ));

    if (!pullRequests.length && !showEmptyQueries && !allPullRequests.length) return null;

    return (
        <CollapsibleBlock
            id={"PR+" + props.accountId}
            caption={s("pullRequestsBlockCaption")}
            accountId={props.accountId}
            isCollapseEnabled={!!pullRequests.length}
            isLoading={isLoading}
            enableColorCode={false}
            counters={{
                total: { count: totalItemsCount },
                teams: { count: totalTeamsCount, color: "blue" },
                hidden: { count: totalHiddenCount, color: "grey" },
            }}
            status={!totalItemsCount && !isLoading && !errorMessage ? "done" : errorMessage ? "error" : undefined}
            iconComponent={<Icon name="level up alternate" />}
            rightBlock={
                <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "baseline", gap: 6 }}>
                    <span
                        title={s("refresh")}
                        className="externalLink"
                        onClick={refreshBlock}
                        style={{ opacity: isLoading ? 0 : 1 }}
                    >
                        <Icon size="small" name="refresh" />
                    </span>
                    <FilterToggleButton
                        label={s("hiddenPrFilter")}
                        checked={includeHiddenPRs}
                        onChange={() => {
                            setIncludeHiddenPRs(!includeHiddenPRs);
                        }}
                        icon="eye slash"
                        visible={hasHidden}
                    />
                    <FilterToggleButton
                        label={s("groupPrFilter")}
                        checked={includeTeamsPRs}
                        onChange={() => {
                            setIncludeTeamsPRs(!includeTeamsPRs);
                        }}
                        icon="users"
                        visible={hasTeams}
                    />
                    <FilterToggleButton
                        label={s("acceptedByMeFilter")}
                        checked={includeAcceptedByMePRs}
                        onChange={() => {
                            setIncludeAcceptedByMePRs(!includeAcceptedByMePRs);
                        }}
                        icon="checkmark"
                        visible={hasAcceptedByMe}
                    />
                </div>
            }
        >
            <>
                {!!errorMessage && (
                    <Message size="tiny" error>
                        {errorMessage}
                    </Message>
                )}
                {!!pullRequestsComponents.length && (
                    <Table className="wiTable" compact size={getTableSize()}>
                        <tbody>{pullRequestsComponents}</tbody>
                    </Table>
                )}
            </>
        </CollapsibleBlock>
    );
}
