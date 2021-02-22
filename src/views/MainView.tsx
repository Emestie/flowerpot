import React, { useState } from "react";
import { Container, Message, Button, Icon, Form } from "semantic-ui-react";
import store from "../store";
import WorkItemsBlock from "../components/WorkItemsBlock";
import WhatsNewBanner from "../components/WhatsNewBanner";
import { observer } from "mobx-react";
import Platform from "../helpers/Platform";
import { IQuery } from "../helpers/Query";
import { s } from "../values/Strings";
import LocalVersionBanner from "../components/LocalVersionBanner";
import SingleInputColorDialog from "../components/SingleInputColorDialog";
import ViewHeading from "../components/ViewHeading";
import FlowerbotBanner from "../components/FlowerbotBanner";

export default observer(() => {
    const [idDial, setIdDial] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const isRefreshAvailable = !!store.getQueries().length && !store.loadingInProgressList.length;

    const onRefresh = () => {
        store.switchView("refreshhelper");
    };

    const onSettings = () => {
        store.switchView("settings");
    };

    const onOpenById = () => setIdDial(true);

    const openById = (id: string, color?: string, collection?: string) => {
        Platform.openUrl(store.settings.tfsPath + collection + "/QA/_workitems?_a=edit&id=" + id);
        setIdDial(false);
    };

    const updateApp = () => Platform.updateApp();

    const markAllAsRead = () => {
        store.clearAllChanges();
    };

    const queriesSorting = (a: IQuery, b: IQuery) => {
        if (a.empty === b.empty) return 0;
        if (!a.empty && b.empty) return -1;
        else return 1;
    };

    const queries = store.getQueries().sort(queriesSorting);
    const collections = queries.map(x => x.collectionName).filter((i,v,a) => a.indexOf(i) === v);

    const queriesElems = queries.length ? (
        queries.map(q => <WorkItemsBlock key={q.queryId} query={q} filter={inputValue}/>)
    ) : (
        <Message info>
            <Message.Header>{s("noQueriesToWatch")}</Message.Header>
            <p>{s("noQueriesToWatchText")}</p>
        </Message>
    );

    if (!queries.length) {
        Platform.updateTrayIcon(4);
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
                <div style={{display: "inline-block", marginRight: 3.5}}>
                <Form.Input
                    size="small"
                    placeholder="Filter work items"
                    value={inputValue}
                    onChange={(e) => {
                        if (e.target.value && !e.target.value.trim()) setInputValue("");
                        else setInputValue(e.target.value)
                    }}
                />
                </div>
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
                <SingleInputColorDialog show={idDial} onClose={() => setIdDial(false)} onOk={openById} caption={s("openByIdText")} dropdownValues={collections} />
                <FlowerbotBanner />
                <WhatsNewBanner />
                {queriesElems}
            </Container>
        </div>
    );
});
