import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Form, Icon, Message } from "semantic-ui-react";
import { LocalVersionBanner } from "../components/LocalVersionBanner";
import { PageLayout } from "../components/PageLayout";
import { WhatsNewBanner } from "../components/banners/WhatsNewBanner";
import { ViewHeading } from "../components/heading/ViewHeading";
import { PullRequestsBlock } from "../components/pull-requests/PullRequestsBlock";
import { WorkItemsBlock } from "../components/work-items/WorkItemsBlock";
import Differences from "../helpers/Differences";
import Platform from "../helpers/Platform";
import { Query } from "../models/query";
import { appDialogSet, appShowMineOnlySet, appViewSet } from "../redux/actions/appActions";
import { dataChangesCollectionClear } from "../redux/actions/dataActions";
import { appSelector } from "../redux/selectors/appSelectors";
import { dataSelector } from "../redux/selectors/dataSelectors";
import { getQueriesSelector, settingsSelector } from "../redux/selectors/settingsSelectors";
import { s } from "../values/Strings";
import { useEventStore } from "../zustand/event";
import { useQuickSearchStore } from "../zustand/quick-search";
import { ActionBannersContainer } from "./containers/ActionBannersContainer";
import { QuickLinksContainer } from "./containers/QuickLinksContainer";

export const queriesSorting = (a: Query, b: Query) => {
    if (a.empty === b.empty) return 0;
    if (!a.empty && b.empty) return -1;
    else return 1;
};

export function MainView() {
    const dispatch = useDispatch();
    const { updateStatus, showMineOnly } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);
    const { changesCollection } = useSelector(dataSelector);
    const storedQueries = useSelector(getQueriesSelector());

    const quickSearchValue = useQuickSearchStore((s) => s.value);
    const setQuickSearchValue = useQuickSearchStore((s) => s.setValue);

    const [isRefreshAvailable, setIsRefreshAvailable] = useState(false);

    const expandCollapseOperation = settings.collapsedBlocks.length ? "expand" : "collapse";

    useEffect(() => {
        setTimeout(() => setIsRefreshAvailable(true), 5000);
    }, []);

    const onShowMineOnly = () => {
        dispatch(appShowMineOnlySet(!showMineOnly));
    };

    const onExpandCollapse = () => {
        if (expandCollapseOperation === "collapse") useEventStore.getState().collapseAll();
        else useEventStore.getState().expandAll();
    };

    const onRefresh = () => {
        dispatch(appViewSet("refreshhelper"));
    };

    const onSettings = () => {
        dispatch(appViewSet("settings"));
    };

    const onOpenById = () => {
        dispatch(appDialogSet("openById", true));
    };

    const updateApp = () => Platform.current.updateApp();

    const markAllAsRead = () => {
        dispatch(dataChangesCollectionClear());
    };

    const queries = storedQueries.sort(queriesSorting);

    const isChangesCollectionHasItems = Differences.isChangesCollectionHasChanges(changesCollection);

    const queriesBlocks =
        settings.accounts.length === 0 ? (
            <Message info>
                <Message.Header>{s("noAccountsSetup")}</Message.Header>
                <p>{s("noAccountsSetupText")}</p>
            </Message>
        ) : queries.length ? (
            queries.map((q) => <WorkItemsBlock key={q.queryId} query={q} />)
        ) : (
            <Message info>
                <Message.Header>{s("noQueriesToWatch")}</Message.Header>
                <p>{s("noQueriesToWatchText")}</p>
            </Message>
        );

    if (!queries.length) {
        Platform.current.updateTrayIcon(4);
    }

    const qlEnabled = settings.showQuickLinks;

    return (
        <PageLayout
            heading={
                <ViewHeading underCaption={qlEnabled && <QuickLinksContainer />}>
                    <div>
                        <LocalVersionBanner />
                        {updateStatus === "ready" && (
                            <Button icon positive onClick={updateApp} title={s("updateArrived")}>
                                {s("installUpdate")}
                            </Button>
                        )}
                        <Button icon onClick={onExpandCollapse} hint={s("expandCollapseAll")}>
                            {expandCollapseOperation === "collapse" ? (
                                <Icon name="angle double down" />
                            ) : (
                                <Icon name="angle double right" />
                            )}
                        </Button>
                        <Button icon onClick={onShowMineOnly} primary={showMineOnly} hint={s("showMineOnly")}>
                            <Icon name="user outline" />
                        </Button>
                        <div style={{ display: "inline-block", marginRight: 3.5 }}>
                            <Form.Input
                                size="small"
                                placeholder={s("quicksearch")}
                                value={quickSearchValue}
                                onChange={(e) => {
                                    if (e.target.value && !e.target.value.trim()) setQuickSearchValue("");
                                    else setQuickSearchValue(e.target.value);
                                }}
                            />
                        </div>
                        <Button icon onClick={onOpenById} hint={s("openById")}>
                            <Icon name="external share" />
                        </Button>
                        {!!settings.showUnreads && isChangesCollectionHasItems && (
                            <Button icon onClick={markAllAsRead} title={s("markAllAsRead")}>
                                <Icon name="check circle outline" />
                            </Button>
                        )}
                        <Button icon onClick={onRefresh} disabled={!isRefreshAvailable} hint={s("refresh")}>
                            <Icon name="refresh" />
                        </Button>
                        <Button icon onClick={onSettings} hint={s("settings")}>
                            <Icon name="setting" />
                        </Button>
                    </div>
                </ViewHeading>
            }
        >
            <Container fluid>
                <WhatsNewBanner />
                <ActionBannersContainer />
                {settings.accounts.map((account) => (
                    <PullRequestsBlock key={account.id} accountId={account.id} />
                ))}
                {queriesBlocks}
            </Container>
        </PageLayout>
    );
}
