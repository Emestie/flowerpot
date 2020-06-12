import React, { useState } from "react";
import { Container, Message, Button, Icon } from "semantic-ui-react";
import store from "../store";
import WorkItemsBlock from "../components/WorkItemsBlock";
import WhatsNewBanner from "../components/WhatsNewBanner";
import { observer } from "mobx-react";
import Electron from "../helpers/Electron";
import { IQuery } from "../helpers/Query";
import { s } from "../values/Strings";
import LocalVersionBanner from "../components/LocalVersionBanner";
import SingleInputColorDialog from "../components/SingleInputColorDialog";
import ViewHeading from "../components/ViewHeading";

export default observer(() => {
    const [idDial, setIdDial] = useState(false);

    const isRefreshAvailable = !!store.getQueries().length && !store.loadingInProgressList.length;

    const onRefresh = () => {
        store.switchView("refreshhelper");
    };

    const onSettings = () => {
        store.switchView("settings");
    };

    const onOpenById = () => setIdDial(true);

    const openById = (id: string) => {
        Electron.openUrl(store.settings.tfsPath + "QA/_workitems?_a=edit&id=" + id);
        setIdDial(false);
    };

    const updateApp = () => Electron.updateApp();

    const markAllAsRead = () => {
        store.clearAllChanges();
    };

    const queriesSorting = (a: IQuery, b: IQuery) => {
        if (a.empty === b.empty) return 0;
        if (!a.empty && b.empty) return -1;
        else return 1;
    };

    const queries = store.getQueries().sort(queriesSorting);

    const queriesElems = queries.length ? (
        queries.map(q => <WorkItemsBlock key={q.queryId} query={q} />)
    ) : (
        <Message info>
            <Message.Header>{s("noQueriesToWatch")}</Message.Header>
            <p>{s("noQueriesToWatchText")}</p>
        </Message>
    );

    if (!queries.length) {
        Electron.updateTrayIcon(4);
    }

    return (
        <div className="Page">
            <ViewHeading>
                <LocalVersionBanner />
                {store.updateStatus === "ready" && (
                    <Button icon positive onClick={updateApp} title={s("updateArrived")}>
                        <Icon name="refresh" />
                    </Button>
                )}
                <Button onClick={onOpenById}>{s("openById")}</Button>
                {!!store.settings.showUnreads && store.isChangesCollectionHasItems() && (
                    <Button icon onClick={markAllAsRead} title={s("markAllAsRead")}>
                        <Icon name="check circle outline" />
                    </Button>
                )}
                <Button onClick={onRefresh} disabled={!isRefreshAvailable}>
                    {s("refresh")}
                </Button>
                <Button onClick={onSettings}>{s("settings")}</Button>
            </ViewHeading>
            <Container fluid>
                <SingleInputColorDialog show={idDial} onClose={() => setIdDial(false)} onOk={openById} caption={s("openByIdText")} />
                <WhatsNewBanner />
                {queriesElems}
            </Container>
        </div>
    );
});
