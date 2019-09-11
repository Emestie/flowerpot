import React from "react";
import { Header, Container, Message, Button } from "semantic-ui-react";
import store from "../store";
import WorkItemsBlock from "../components/WorkItemsBlock";
import { observer } from "mobx-react";
import Electron from "../helpers/Electron";
import { IQuery } from "../helpers/Query";
import { s } from "../values/Strings";

interface IProps {}
interface IState {
    updateInstallInProgress: boolean;
}

@observer
export default class MainView extends React.Component<IProps, IState> {
    state: IState = {
        updateInstallInProgress: false
    };

    get isRefreshAvailable() {
        return !!store.getQueries().length;
    }

    onRefresh = () => {
        store.restartRoutines();
    };

    onSettings = () => {
        store.switchView("settings");
    };

    onUpdate = () => {
        this.setState({ updateInstallInProgress: true });
        Electron.updateApp();
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
                        {/* <Button onClick={this.onRefresh} disabled={!this.isRefreshAvailable}>
                            {s('refresh')}
                        </Button> */}
                        <Button onClick={this.onSettings}>{s("settings")}</Button>
                    </div>
                </div>
                <Container fluid>
                    {store.updateStatus === "ready" && (
                        <Message positive>
                            <Message.Header>{s("updateArrived")}</Message.Header>
                            <p>
                                {s("updateArrivedText1")}{" "}
                                <Button compact positive size="tiny" loading={this.state.updateInstallInProgress} onClick={this.onUpdate}>
                                    {s("install")}
                                </Button>{" "}
                                {s("updateArrivedText2")}
                            </p>
                        </Message>
                    )}
                    {queriesElems}
                </Container>
            </div>
        );
    }
}
