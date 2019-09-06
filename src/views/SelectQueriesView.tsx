import React from "react";
import { Header, Container, Button, Label, Message, Icon, Checkbox } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import Query, { IQuery } from "../helpers/Query";
import Loaders from "../helpers/Loaders";

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
        isLoading: true,
        availableQueries: [],
    };

    componentDidMount() {
        this.loadQueries();
    }

    get isAddAvailable() {
        return !!this.state.availableQueries.filter(q => q.checked).length;
    }

    loadQueries() {
        setTimeout(() => {
            Loaders.loadAvailableQueries().then(queries => {
                let currentQueriesIds = store.settings.queries.map(q => q.queryId);
                let queriesToSelect = queries.filter(q => !currentQueriesIds.includes(q.queryId)) as ISelectableQuery[];
                queriesToSelect.forEach(q => (q.checked = true));
                this.setState({ availableQueries: queriesToSelect, isLoading: false });
            });
        }, 50);
    }

    onAdd = () => {
        this.state.availableQueries.filter(q => q.checked).forEach(q => Query.add(q));
        this.setState({ isLoading: true, availableQueries: [] });
        store.switchView("settings");
    };

    onCancel = () => {
        //TODO: clear local state
        store.switchView("settings");
    };

    toggleCheck = (query: ISelectableQuery) => {
        let all = this.state.availableQueries;
        let index = all.findIndex(q => q.queryId === query.queryId);
        all[index].checked = !all[index].checked;
        this.setState({ availableQueries: all });
    };

    render() {
        let queryList = this.state.isLoading ? (
            <Message icon>
                <Icon name="circle notched" loading />
                <Message.Content>Loading...</Message.Content>
            </Message>
        ) : this.state.availableQueries.length ? (
            this.state.availableQueries.map(q => (
                <div key={q.queryId} style={{ marginBottom: 5 }}>
                    <Checkbox label={q.teamName + " / " + q.queryName} checked={q.checked} onChange={() => this.toggleCheck(q)} />
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
