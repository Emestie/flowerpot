import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Container, Form, Icon, Message } from "semantic-ui-react";
import { LocalVersionBanner } from "../components/LocalVersionBanner";
import { PageLayout } from "../components/PageLayout";
import { WhatsNewBanner } from "../components/banners/WhatsNewBanner";
import { ViewHeading } from "../components/heading/ViewHeading";
import { PullRequestsBlock } from "../components/pull-requests/PullRequestsBlock";
import { WorkItemsBlock } from "../components/work-items/WorkItemsBlock";
import { triggerCollapseAll, triggerExpandAll } from "../events/collapse-expand";
import Differences from "../helpers/Differences";
import Platform from "../helpers/Platform";
import { Query } from "../models/query";
import { getQueriesSelector, settingsSelector } from "../redux/selectors/settingsSelectors";
import { useDataStore } from "../zustand/data";
import { s } from "../values/Strings";
import { useQuickSearchStore } from "../zustand/quick-search";
import { useAppStore } from "../zustand/app";
import { ActionBannersContainer } from "./containers/ActionBannersContainer";
import { QuickLinksContainer } from "./containers/QuickLinksContainer";

export const queriesSorting = (a: Query, b: Query) => {
    if (a.empty === b.empty) return 0;
    if (!a.empty && b.empty) return -1;
    else return 1;
};

export function MainView() {
    const updateStatus = useAppStore((state) => state.updateStatus);
    const showMineOnly = useAppStore((state) => state.showMineOnly);
    const setView = useAppStore((state) => state.setView);
    const setDialog = useAppStore((state) => state.setDialog);
    const setShowMineOnly = useAppStore((state) => state.setShowMineOnly);
    const settings = useSelector(settingsSelector);
    const changesCollection = useDataStore((state) => state.changesCollection);
    const storedQueries = useSelector(getQueriesSelector());
    const setQuickSearchValue = useQuickSearchStore((s) => s.setValue);
    const clearChangesCollection = useDataStore((state) => state.clearChangesCollection);
    const [isRefreshAvailable, setIsRefreshAvailable] = useState(false);
    const [isMobileSearchShown, setIsMobileSearchShown] = useState(false);
    const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);

    const expandCollapseOperation = settings.collapsedBlocks.length ? "expand" : "collapse";

    useEffect(() => {
        setTimeout(() => setIsRefreshAvailable(true), 5000);
    }, []);

    useEffect(() => {
        if (!isMobileSearchShown) {
            setQuickSearchValue("");
        }
    }, [isMobileSearchShown]);

    const onShowMineOnly = () => {
        setShowMineOnly(!showMineOnly);
    };

    const onExpandCollapse = () => {
        if (expandCollapseOperation === "collapse") triggerCollapseAll();
        else triggerExpandAll();
    };

    const onRefresh = () => {
        setView("refreshhelper");
    };

    const onSettings = () => {
        setView("settings");
    };

    const onOpenById = () => {
        setDialog("openById", true);
    };

    const showSearchBar = () => {
        setIsMobileSearchShown((s) => !s);
    };

    const updateApp = () => {
        setIsInstallingUpdate(true);
        Platform.current.updateApp();
    };

    const markAllAsRead = () => {
        clearChangesCollection();
    };

    const queries = storedQueries.sort(queriesSorting);

    const isChangesCollectionHasItems = Differences.isChangesCollectionHasChanges(changesCollection);

    const noAccounts = settings.accounts.length === 0;

    const queriesBlocks = noAccounts ? (
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
                            <Button
                                icon
                                positive
                                onClick={updateApp}
                                title={s("updateArrived")}
                                disabled={isInstallingUpdate}
                            >
                                {s("installUpdate")}
                            </Button>
                        )}
                        {!noAccounts && (
                            <Button
                                icon
                                onClick={onExpandCollapse}
                                hint={s("expandCollapseAll")}
                                title={s("expandCollapseAll")}
                                className="hide-on-mobile"
                            >
                                {expandCollapseOperation === "collapse" ? (
                                    <Icon name="angle double down" />
                                ) : (
                                    <Icon name="angle double right" />
                                )}
                            </Button>
                        )}
                        {!noAccounts && (
                            <Button
                                icon
                                onClick={onShowMineOnly}
                                primary={showMineOnly}
                                hint={s("showMineOnly")}
                                title={s("showMineOnly")}
                            >
                                <Icon name="user outline" />
                            </Button>
                        )}
                        {!noAccounts && (
                            <div className="hide-on-mobile" style={{ display: "inline-block", marginRight: 3.5 }}>
                                <SearchBar />
                            </div>
                        )}
                        {!noAccounts && (
                            <Button
                                className="show-on-mobile"
                                icon
                                onClick={showSearchBar}
                                hint={s("showSearch")}
                                title={s("showSearch")}
                                primary={isMobileSearchShown}
                            >
                                <Icon name="search" />
                            </Button>
                        )}
                        {!noAccounts && (
                            <Button icon onClick={onOpenById} hint={s("openById")} title={s("openById")}>
                                <Icon name="external share" />
                            </Button>
                        )}
                        {!!settings.showUnreads && isChangesCollectionHasItems && !noAccounts && (
                            <Button icon onClick={markAllAsRead} title={s("markAllAsRead")}>
                                <Icon name="check circle outline" />
                            </Button>
                        )}
                        {!noAccounts && (
                            <Button
                                icon
                                onClick={onRefresh}
                                disabled={!isRefreshAvailable}
                                hint={s("refresh")}
                                title={s("refresh")}
                            >
                                <Icon name="refresh" />
                            </Button>
                        )}
                        <Button icon onClick={onSettings} hint={s("settings")} title={s("settings")}>
                            <Icon name="setting" />
                        </Button>
                    </div>
                </ViewHeading>
            }
        >
            <Container fluid>
                {isMobileSearchShown && (
                    <div className="show-on-mobile">
                        <SearchBar />
                    </div>
                )}
                <WhatsNewBanner />
                {!noAccounts && <ActionBannersContainer />}
                {settings.accounts.map((account) => (
                    <PullRequestsBlock key={account.id} accountId={account.id} />
                ))}
                {queriesBlocks}
            </Container>
        </PageLayout>
    );
}

function SearchBar() {
    const quickSearchValue = useQuickSearchStore((s) => s.value);
    const setQuickSearchValue = useQuickSearchStore((s) => s.setValue);

    return (
        <Form.Input
            className="qs-input"
            size="small"
            placeholder={s("quicksearch")}
            value={quickSearchValue}
            onChange={(e) => {
                if (e.target.value && !e.target.value.trim()) setQuickSearchValue("");
                else setQuickSearchValue(e.target.value);
            }}
        />
    );
}
