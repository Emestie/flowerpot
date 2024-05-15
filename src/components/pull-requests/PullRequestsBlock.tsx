import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Header, Icon, Label, Message, Table } from "semantic-ui-react";
import { usePullRequestsLoader } from "../../hooks/usePullRequestsLoader";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { PullRequestRow } from "./PullRequestRow";
import { settingsUpdate } from "/@/redux/actions/settingsActions";

export function PullRequestsBlock() {
    const { projects, tableScale, includeTeamsPRs } = useSelector(settingsSelector);
    const dispatch = useDispatch();

    const { isLoading, pullRequests, routineStart, errorMessage, hasTeams } = usePullRequestsLoader(
        projects,
        includeTeamsPRs
    );

    if (!projects.filter((p) => p.enabled).length) return null;

    const totalItemsCount = pullRequests.length;

    const refreshBlock = () => {
        if (!isLoading) routineStart();
    };

    const getTableSize = () => {
        return tableScale === 1 ? undefined : tableScale === 2 ? "large" : "small";
    };

    const pullRequestsComponents = pullRequests.map((pr) => <PullRequestRow key={pr.id} pullRequest={pr} />);

    return (
        <>
            <Header as="h3" dividing>
                {isLoading && (
                    <span>
                        <Icon name="circle notched" loading />
                    </span>
                )}
                <span>
                    <span>
                        <Icon name="level up alternate" />
                    </span>{" "}
                    {s("pullRequestsBlockCaption")}
                </span>
                <span className="WICounts">
                    {!!totalItemsCount && (
                        <Label size="mini" circular>
                            {totalItemsCount}
                        </Label>
                    )}
                    {!totalItemsCount &&
                        !isLoading &&
                        (!errorMessage ? (
                            <Label size="mini" circular color="green">
                                ✔
                            </Label>
                        ) : (
                            <Label size="mini" circular color="red">
                                &times;
                            </Label>
                        ))}
                </span>
                <span
                    title={s("refresh")}
                    className="externalLink"
                    onClick={refreshBlock}
                    style={{ opacity: isLoading ? 0 : 1 }}
                >
                    <Icon size="small" name="refresh" />
                </span>
                {hasTeams && (
                    <span className="group-pr-checkbox">
                        <Checkbox
                            label={s("groupPrFilter")}
                            checked={includeTeamsPRs}
                            onChange={() => {
                                dispatch(settingsUpdate({ includeTeamsPRs: !includeTeamsPRs }));
                            }}
                        />
                    </span>
                )}
            </Header>
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
    );
}
