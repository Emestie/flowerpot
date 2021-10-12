import React, { useState } from "react";
import { Container, Message, Button, Icon, Form } from "semantic-ui-react";
import store from "../store-mbx";
import WorkItemsBlock from "../components/WorkItemsBlock";
import WhatsNewBanner from "../components/banners/WhatsNewBanner";
import { observer } from "mobx-react";
import Platform from "../helpers/Platform";
import { IQuery } from "../helpers/Query";
import { s } from "../values/Strings";
import LocalVersionBanner from "../components/LocalVersionBanner";
import ViewHeading from "../components/heading/ViewHeading";
import ActionBannersContainer from "./containers/ActionBannersContainer";
import QuickLinksContainer from "./containers/QuickLinksContainer";

export const queriesSorting = (a: IQuery, b: IQuery) => {
    if (a.empty === b.empty) return 0;
    if (!a.empty && b.empty) return -1;
    else return 1;
};

export default observer(() => {
    const [quickSearchVal, setQuickSearchVal] = useState("");

    const isRefreshAvailable = !!store.getQueries().length && !store.loadingInProgressList.length;

    const onRefresh = () => {
        store.switchView("refreshhelper");
    };

    const onSettings = () => {
        store.switchView("settings");
    };

    const onOpenById = () => {
        store.dialogs.openById = true;
    };

    const updateApp = () => Platform.current.updateApp();

    const markAllAsRead = () => {
        store.clearAllChanges();
    };

    const queries = store.getQueries().sort(queriesSorting);

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

    const qlEnabled = store.settings.showQuickLinks;

    return (
        <div className="Page" style={{ paddingTop: qlEnabled ? 85 : undefined }}>
            <ViewHeading>
                <div>
                    <LocalVersionBanner />
                    {store.updateStatus === "ready" && (
                        <Button icon positive onClick={updateApp} title={s("updateArrived")}>
                            <Icon name="refresh" />
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
                    {!!store.settings.showUnreads && store.isChangesCollectionHasItems() && (
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
                {qlEnabled && <QuickLinksContainer />}
            </ViewHeading>
            <Container fluid>
                <WhatsNewBanner />
                <ActionBannersContainer />
                {queriesElems}
            </Container>
        </div>
    );
});
