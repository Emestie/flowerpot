import React, { useState } from "react";
import { Header, Container, Message, Button } from "semantic-ui-react";
import store from "../store";
import WorkItemsBlock from "../components/WorkItemsBlock";
import UpdateBanner from "../components/UpdateBanner";
import WhatsNewBanner from "../components/WhatsNewBanner";
import { observer } from "mobx-react";
import Electron from "../helpers/Electron";
import { IQuery } from "../helpers/Query";
import { s } from "../values/Strings";
import LocalVersionBanner from "../components/LocalVersionBanner";
import SingleInputColorDialog from "../components/SingleInputColorDialog";

export default observer(() => {
    const [idDial, setIdDial] = useState(false);

    const isRefreshAvailable = !!store.getQueries().length;

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
            <div className="TopBar">
                <Header as="h1">{s("mainHeader")}</Header>
                <div className="RightTopCorner">
                    <LocalVersionBanner />
                    <Button onClick={onOpenById}>{s("openById")}</Button>
                    <Button onClick={onRefresh} disabled={!isRefreshAvailable}>
                        {s("refresh")}
                    </Button>
                    <Button onClick={onSettings}>{s("settings")}</Button>
                </div>
            </div>
            <Container fluid>
                <SingleInputColorDialog show={idDial} onClose={() => setIdDial(false)} onOk={openById} caption={s("openByIdText")} />
                <UpdateBanner />
                <WhatsNewBanner />
                {queriesElems}
            </Container>
        </div>
    );
});
