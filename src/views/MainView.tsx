import React from "react";
import { Header, Container, Message, Button } from "semantic-ui-react";
import store from "../store";
import WorkItemsBlock from "../components/WorkItemsBlock";
import UpdateBanner from "../components/UpdateBanner";
import { observer } from "mobx-react";
import Electron from "../helpers/Electron";
import { IQuery } from "../helpers/Query";
import { s } from "../values/Strings";

interface IProps {}
interface IState {}

@observer
export default class MainView extends React.Component<IProps, IState> {
    state: IState = {
        updateInstallInProgress: false,
    };

    get isRefreshAvailable() {
        return !!store.getQueries().length;
    }

    onRefresh = () => {
        //store.restartRoutines();
        store.switchView('refreshhelper');
    };

    onSettings = () => {
        store.switchView("settings");
    };

    queriesSorting = (a: IQuery, b: IQuery) => {
        if (a.empty === b.empty) return 0;
        if (!a.empty && b.empty) return -1;
        else return 1;
    };

    render() {
        let queries = store.getQueries().sort(this.queriesSorting);

        let queriesElems = queries.length ? (
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
                        <Button onClick={this.onRefresh} disabled={!this.isRefreshAvailable}>
                            {s('refresh')}
                        </Button>
                        <Button onClick={this.onSettings}>{s("settings")}</Button>
                    </div>
                </div>
                <Container fluid>
                    <UpdateBanner />
                    {queriesElems}
                </Container>
            </div>
        );
    }
}
