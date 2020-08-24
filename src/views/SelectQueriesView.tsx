import React from "react";
import { Header, Container, Button, Label, Message, Icon, Checkbox } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import Query, { IQuery } from "../helpers/Query";
import Loaders from "../helpers/Loaders";
import { s } from "../values/Strings";
import ViewHeading from "../components/ViewHeading";

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
        return !!this.state.availableQueries.filter((q) => q.checked).length;
    }

    loadQueries() {
        setTimeout(() => {
            Loaders.loadAvailableQueries().then((queries) => {
                let currentQueriesIds = store.settings.queries.map((q) => q.queryId);
                let queriesToSelect = queries.filter((q) => !currentQueriesIds.includes(q.queryId)) as ISelectableQuery[];
                queriesToSelect.forEach((q) => (q.checked = false));
                this.setState({ availableQueries: queriesToSelect, isLoading: false });
            });
        }, 50);
    }

    onAdd = () => {
        this.state.availableQueries.filter((q) => q.checked).forEach((q) => Query.add(q));
        this.setState({ isLoading: true, availableQueries: [] });
        store.switchView("settings");
    };

    onCancel = () => {
        this.setState({ availableQueries: [] });
        store.switchView("settings");
    };

    onRefresh = () => {
        this.setState({ isLoading: true });
        this.loadQueries();
    };

    toggleCheck = (query: ISelectableQuery) => {
        let all = this.state.availableQueries;
        let index = all.findIndex((q) => q.queryId === query.queryId);
        all[index].checked = !all[index].checked;
        this.setState({ availableQueries: all });
    };

    render() {
        let queryList = this.state.isLoading ? (
            <Message icon>
                <Icon name="circle notched" loading />
                <Message.Content> {s("loading")}</Message.Content>
            </Message>
        ) : this.state.availableQueries.length ? (
            this.state.availableQueries.map((q) => (
                <div key={q.queryId} style={{ marginBottom: 5 }}>
                    <Checkbox
                        label={q.collectionName + " / " + q.teamName + " / " + q.queryName}
                        checked={q.checked}
                        onChange={() => this.toggleCheck(q)}
                    />
                </div>
            ))
        ) : (
            <Message visible color="red">
                {s("noQueriesAvailable")}
            </Message>
        );

        return (
            <div className="Page">
                <ViewHeading>
                    <Button onClick={this.onCancel}>{s("cancel")}</Button>
                    <Button onClick={this.onAdd} positive disabled={!this.isAddAvailable}>
                        {s("add")}
                    </Button>
                </ViewHeading>
                <Container fluid>
                    <Label color="orange">{s("note")}</Label> {s("selqNote1")}
                    <b>{s("selqNote4")}</b>
                    {s("selqNote5")}
                    <Header as="h3" dividing>
                        {s("selqAvailableHeader")}{" "}
                        <span>
                            <Button compact size="tiny" onClick={this.onRefresh} disabled={this.state.isLoading}>
                                {s("refresh")}
                            </Button>
                        </span>
                    </Header>
                    {queryList}
                </Container>
            </div>
        );
    }
}
