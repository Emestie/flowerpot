import React from "react";
import { Header, Container, Button, Label, Message, Icon, Checkbox } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import Query, { IQuery } from "../helpers/Query";

interface IProps {}
interface IState {
    isLoading: boolean;
    availableQueries: ISelectableQuery[];
}

interface ISelectableQuery extends IQuery {
    checked: boolean;
}

@observer
export default class SelectQueriesView extends React.Component<IProps, IState> {
    state: IState = {
        isLoading: false,
        availableQueries: [
            { queryId: "xaax", queryName: "lol", collapsed: false, enabled: true, teamId: "lalac", teamName: "xllx", order: 99, checked: true },
            { queryId: "xaax2", queryName: "lol2", collapsed: false, enabled: true, teamId: "lalac", teamName: "xllx", order: 99, checked: true },
        ],
    };

    get isAddAvailable() {
        return !!this.state.availableQueries.length;
    }

    onAdd = () => {
        this.state.availableQueries.forEach(q => Query.add(q));

        this.setState({ isLoading: true, availableQueries: [] });

        store.switchView("settings");
    };

    onCancel = () => {
        //TODO: clear local state
        store.switchView("settings");
    };

    render() {
        let queryList = this.state.isLoading ? (
            <Message icon>
                <Icon name="circle notched" loading />
                <Message.Content>Loading...</Message.Content>
            </Message>
        ) : this.state.availableQueries.length ? (
            this.state.availableQueries.map(q => (
                <div style={{ marginBottom: 5 }}>
                    <Checkbox key={q.queryId} label={q.teamName + " / " + q.queryName} checked={q.checked} />
                </div>
            ))
        ) : (
            <Message visible color="red">
                You don't have any available queries. Make sure you added desired ones to Favorites in TFS.
            </Message>
        );

        return (
            <div className="Page">
                <div className="TopBar">
                    <Header as="h1">Select Queries</Header>
                    <div className="RightTopCorner">
                        <Button onClick={this.onCancel}>Cancel</Button>
                        <Button onClick={this.onAdd} positive disabled={!this.isAddAvailable}>
                            Add
                        </Button>
                    </div>
                </div>
                <Container fluid>
                    <Label color="orange">NOTE!</Label> You can see here only queries that in your <b>Favorites</b> and <b>not yet added</b> to watch
                    list.
                    <Header as="h3" dividing>
                        Available queries
                    </Header>
                    {queryList}
                </Container>
            </div>
        );
    }
}
