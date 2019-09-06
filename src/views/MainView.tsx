import React from "react";
import { Header, Container, Message, Button } from "semantic-ui-react";
import store from "../store";
import WorkItemsBlock from "../components/WorkItemsBlock";
import { observer } from "mobx-react";

interface IProps {}
interface IState {}

@observer
export default class MainView extends React.Component<IProps, IState> {
    get isRefreshAvailable() {
        return !!store.getQueries().length;
    }

    onRefresh = () => {
        store.restartRoutines();
    };

    onSettings = () => {
        store.switchView("settings");
    };

    render() {
        let queries = store.getQueries();
        let queriesElems = queries.length ? (
            queries.map(q => (
                <>
                    <WorkItemsBlock query={q} />
                </>
            ))
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
                <Container fluid>{queriesElems}</Container>
            </div>
        );
    }
}
