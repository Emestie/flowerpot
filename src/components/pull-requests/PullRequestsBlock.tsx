import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Icon, Message, Table } from "semantic-ui-react";
import { usePullRequestsLoader } from "../../hooks/usePullRequestsLoader";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { CollapsibleBlock } from "../CollapsibleBlock";
import { PullRequestRow } from "./PullRequestRow";
import { settingsUpdate } from "/@/redux/actions/settingsActions";

export function PullRequestsBlock(props: { accountId: string }) {
    const {
        projects: _allProjects,
        tableScale,
        includeTeamsPRs,
        includeAcceptedByMePRs,
    } = useSelector(settingsSelector);
    const dispatch = useDispatch();

    const projects = useMemo(() => _allProjects.filter((x) => x.accountId === props.accountId), []);

    const { isLoading, pullRequests, routineStart, errorMessage, hasTeams, hasAcceptedByMe } = usePullRequestsLoader(
        props.accountId,
        projects,
        includeTeamsPRs,
        includeAcceptedByMePRs
    );

    if (!projects.filter((p) => p.enabled).length) return null;

    const totalItemsCount = pullRequests.length;
    const totalTeamsCount = pullRequests.filter((x) => x.getBelonging() === "team").length;

    const refreshBlock = () => {
        if (!isLoading) routineStart();
    };

    const getTableSize = () => {
        return tableScale === 1 ? undefined : tableScale === 2 ? "large" : "small";
    };

    const pullRequestsComponents = pullRequests.map((pr) => (
        <PullRequestRow key={pr.id} pullRequest={pr} accountId={props.accountId} />
    ));

    return (
        <CollapsibleBlock
            id={"PR+" + props.accountId}
            caption={s("pullRequestsBlockCaption")}
            accountId={props.accountId}
            isCollapseEnabled={!!pullRequests.length}
            isLoading={isLoading}
            enableColorCode={false}
            counters={{ total: { count: totalItemsCount }, teams: { count: totalTeamsCount, color: "blue" } }}
            status={!totalItemsCount && !isLoading && !errorMessage ? "done" : errorMessage ? "error" : undefined}
            iconComponent={<Icon name="level up alternate" />}
            rightBlock={
                <div style={{ display: "flex", flexDirection: "row-reverse" }}>
                    <span
                        title={s("refresh")}
                        className="externalLink"
                        onClick={refreshBlock}
                        style={{ opacity: isLoading ? 0 : 1 }}
                    >
                        <Icon size="small" name="refresh" />
                    </span>
                    {
                        <span className="group-pr-checkbox">
                            <Checkbox
                                label={s("groupPrFilter")}
                                checked={includeTeamsPRs}
                                onChange={() => {
                                    dispatch(settingsUpdate({ includeTeamsPRs: !includeTeamsPRs }));
                                }}
                            />
                        </span>
                    }
                    {hasAcceptedByMe && (
                        <span className="group-pr-checkbox">
                            <Checkbox
                                label={s("acceptedByMeFilter")}
                                checked={includeAcceptedByMePRs}
                                onChange={() => {
                                    dispatch(settingsUpdate({ includeAcceptedByMePRs: !includeAcceptedByMePRs }));
                                }}
                            />
                        </span>
                    )}
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
