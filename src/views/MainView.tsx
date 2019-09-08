import React from "react";
import { Header, Container, Message, Button } from "semantic-ui-react";
import store from "../store";
import WorkItemsBlock from "../components/WorkItemsBlock";
import { observer } from "mobx-react";
import Electron from "../helpers/Electron";

interface IProps {}
interface IState {}

@observer
export default class MainView extends React.Component<IProps, IState> {
    componentDidMount() {
        let ipcRenderer = Electron.getIpcRenderer();
        if (!ipcRenderer) return;
        ipcRenderer.on("update_available", () => {
            ipcRenderer.removeAllListeners("update_available");
            store.updateReady = true;
        });
    }

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
        Electron.updateApp();
    };

    render() {
        let queries = store.getQueries();
        let queriesElems = queries.length ? (
            queries.map(q => <WorkItemsBlock key={q.queryId} query={q} />)
        ) : (
            <Message info>
                <Message.Header>No queries found</Message.Header>
                <p>Go to settings and add some</p>
            </Message>
        );

        return (
            <div className="Page">
                <div className="TopBar">
                    <Header as="h1">Queries</Header>
                    <div className="RightTopCorner">
                        <Button onClick={this.onRefresh} disabled={!this.isRefreshAvailable}>
                            Refresh
                        </Button>
                        <Button onClick={this.onSettings}>Settings</Button>
                    </div>
                </div>
                <Container fluid>
                    {store.updateReady && (
                        <Message positive>
                            <Message.Header>Update arrived!</Message.Header>
                            <p>
                                Flowerpot update is available. You can{" "}
                                <Button compact positive size="tiny" onClick={this.onUpdate}>
                                    Install
                                </Button>{" "}
                                it now by restarting the app.
                            </p>
                        </Message>
                    )}
                    {queriesElems}
                </Container>
            </div>
        );
    }
}
