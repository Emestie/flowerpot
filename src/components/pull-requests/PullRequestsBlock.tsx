import { useSelector } from "react-redux";
import { Header, Icon, Label, Table } from "semantic-ui-react";
import { usePullRequestsLoader } from "../../hooks/usePullRequestsLoader";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { PullRequestRow } from "./PullRequestRow";

export function PullRequestsBlock() {
    const { projects, tableScale } = useSelector(settingsSelector);

    const { isLoading, pullRequests, routineStart } = usePullRequestsLoader(projects);

    if (!projects.filter((p) => p.enabled).length) return null;

    const totalItemsCount = pullRequests.length;

    const refreshBlock = () => {
        routineStart();
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
                    {!totalItemsCount && !isLoading && (
                        <Label size="mini" circular color="green">
                            ✔
                        </Label>
                    )}
                </span>
                {!isLoading && (
                    <span title={s("refresh")} className="externalLink" onClick={refreshBlock}>
                        <Icon size="small" name="refresh" />
                    </span>
                )}
            </Header>
            {!!pullRequestsComponents.length && (
                <Table compact size={getTableSize()}>
                    <tbody>{pullRequestsComponents}</tbody>
                </Table>
            )}
        </>
    );
}
