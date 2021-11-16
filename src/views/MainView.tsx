import React, { useEffect, useLayoutEffect, useState } from "react";
import { Container, Message, Button, Icon, Form } from "semantic-ui-react";
import { WorkItemsBlock } from "../components/WorkItemsBlock";
import { WhatsNewBanner } from "../components/banners/WhatsNewBanner";
import Platform from "../helpers/Platform";
import { IQuery } from "../helpers/Query";
import { s } from "../values/Strings";
import { LocalVersionBanner } from "../components/LocalVersionBanner";
import { ViewHeading } from "../components/heading/ViewHeading";
import { ActionBannersContainer } from "./containers/ActionBannersContainer";
import { QuickLinksContainer } from "./containers/QuickLinksContainer";
import { useDispatch, useSelector } from "react-redux";
import { appDialogSet, appViewSet } from "../redux/actions/appActions";
import { appSelector } from "../redux/selectors/appSelectors";
import { getQueriesSelector, settingsSelector } from "../redux/selectors/settingsSelectors";
import { dataChangesCollectionClear } from "../redux/actions/dataActions";
import { dataSelector } from "../redux/selectors/dataSelectors";
import Differences from "../helpers/Differences";

export const queriesSorting = (a: IQuery, b: IQuery) => {
    if (a.empty === b.empty) return 0;
    if (!a.empty && b.empty) return -1;
    else return 1;
};

export function MainView() {
    const dispatch = useDispatch();
    const { updateStatus } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);
    const { changesCollection } = useSelector(dataSelector);
    const storedQueries = useSelector(getQueriesSelector());

    const [quickSearchVal, setQuickSearchVal] = useState("");

    const [isRefreshAvailable, setIsRefreshAvailable] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsRefreshAvailable(true), 5000);
    }, []);

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

    const queriesElems = queries.length ? (
        queries.map((q) => <WorkItemsBlock key={q.queryId} query={q} filter={quickSearchVal} />)
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

    const [headHeight, setHeadHeight] = useState(0);

    useLayoutEffect(() => {
        const vh = document.getElementById("ViewHeading");
        setHeadHeight((vh?.clientHeight || 0) + 5);
    }, [settings.links.length]);

    return (
        <div className="Page" style={{ paddingTop: headHeight }}>
            <ViewHeading underCaption={qlEnabled && <QuickLinksContainer />}>
                <div>
                    <LocalVersionBanner />
                    {updateStatus === "ready" && (
                        <Button icon positive onClick={updateApp} title={s("updateArrived")}>
                            {s("installUpdate")}
                        </Button>
                    )}
                    <div style={{ display: "inline-block", marginRight: 3.5 }}>
                        <Form.Input
                            size="small"
                            placeholder={s("quicksearch")}
                            value={quickSearchVal}
                            onChange={(e) => {
                                if (e.target.value && !e.target.value.trim()) setQuickSearchVal("");
                                else setQuickSearchVal(e.target.value);
                            }}
                        />
                    </div>
                    <Button onClick={onOpenById}>{s("openById")}</Button>
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
            <Container fluid>
                <WhatsNewBanner />
                <ActionBannersContainer />
                {queriesElems}
            </Container>
        </div>
    );
}
