import React from "react";
import { Header, Label, Table, Icon } from "semantic-ui-react";
import store from "../store";
import Query, { IQuery } from "../helpers/Query";
import { observer } from "mobx-react";
import WorkItemRow from "./WorkItemRow";
import { IWorkItem } from "../helpers/WorkItem";
import Loaders from "../helpers/Loaders";
import Electron from "../helpers/Electron";

interface IProps {
    query: IQuery;
}
interface IState {
    workItems: IWorkItem[];
    isLoading: boolean;
}

@observer
export default class WorkItemsBlock extends React.Component<IProps, IState> {
    state: IState = { workItems: [], isLoading: true };

    // private onRoutinesRestart = reaction(() => store._routinesRestart, () => this.routineStart());

    componentWillUnmount() {
        store.clearInterval(this.props.query);
    }

    async componentDidMount() {
        setTimeout(async () => {
            this.routineStart();
        }, 100);
    }

    async routineStart() {
        this.setState({ workItems: [], isLoading: true });

        store.clearInterval(this.props.query);

        await this.loadWorkItemsForThisQuery();

        store.setInterval(
            this.props.query,
            setInterval(() => {
                this.loadWorkItemsForThisQuery();
            }, store.settings.refreshRate * 1000)
        );
    }

    async loadWorkItemsForThisQuery() {
        console.log("updating query", this.props.query.queryId);
        let wis = await Loaders.loadQueryWorkItems(this.props.query);
        Query.calculateIconLevel(this.props.query, wis);
        //set query emptiness to sort them
        Query.toggleBoolean(this.props.query, "empty", !wis.length);
        this.setState({ workItems: wis, isLoading: false });
    }

    get totalItems() {
        return this.state.workItems.length;
    }

    get redItems() {
        return this.state.workItems.filter(wi => wi.promptness === 1 || wi.rank === 1).length;
    }

    get orangeItems() {
        return this.state.workItems.filter(wi => wi.promptness === 2).length;
    }

    get atLeastOneWiHasChanges() {
        let wis = this.state.workItems;
        let changes = false;
        wis.forEach(wi => {
            if (!changes) changes = store.getWIHasChanges(wi);
        });
        return changes;
    }

    onCollapseClick = () => {
        Query.toggleBoolean(this.props.query, "collapsed");
    };

    onQueryNameClick = () => {
        let q = this.props.query;
        if (!q.queryPath) return;

        Electron.openUrl(store.settings.tfsPath + q.teamName + "/_workItems?path=" + q.queryPath + "&_a=query");
    };

    getSortPattern = () => {
        switch (store.settings.sortPattern) {
            case "assignedto":
                return this.sortPatternAssignedTo;
            case "id":
                return this.sortPatternId;
            default:
                return this.sortPatternDefault;
        }
    };

    sortPatternDefault = (a: IWorkItem, b: IWorkItem) => {
        if (a.weight < b.weight) return -1;
        else if (a.weight > b.weight) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    sortPatternAssignedTo = (a: IWorkItem, b: IWorkItem) => {
        if (a.assignedTo < b.assignedTo) return -1;
        else if (a.assignedTo > b.assignedTo) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    sortPatternId = (a: IWorkItem, b: IWorkItem) => {
        if (a.id < b.id) return -1;
        else return 1;
    };

    dropAllWiChanges = () => {
        this.state.workItems.forEach(wi => {
            store.setWIHasChanges(wi, false);
        });
    };

    render() {
        let query = this.props.query;
        let workItems = this.state.workItems.sort(this.getSortPattern()).map(wi => <WorkItemRow key={wi.id} item={wi} />);

        let iconCollapse = query.collapsed ? <Icon name="angle right" /> : <Icon name="angle down" />;

        return (
            <>
                <Header as="h3" dividing>
                    {!this.state.isLoading && !!this.state.workItems.length && <span onClick={this.onCollapseClick}>{iconCollapse}</span>}
                    <span onClick={this.dropAllWiChanges}>
                        <span className={query.queryPath ? "WorkItemLink" : ""} onClick={this.onQueryNameClick}>
                            {query.queryName}
                        </span>
                        <small>
                            <span style={{ marginLeft: 10, color: "gray" }}>{query.teamName}</span>
                        </small>
                    </span>
                    {!!this.redItems && (
                        <Label size="small" circular color="red">
                            {this.redItems}
                        </Label>
                    )}
                    {!!this.orangeItems && (
                        <Label size="small" circular color="orange">
                            {this.orangeItems}
                        </Label>
                    )}
                    {!!this.totalItems && (
                        <Label size="small" circular>
                            {this.totalItems}
                        </Label>
                    )}
                    {!this.totalItems && !this.state.isLoading && (
                        <Label size="small" circular color="green">
                            ✔
                        </Label>
                    )}
                    {this.state.isLoading && <Label size="small">Loading...</Label>}
                </Header>
                {!!this.state.workItems.length && !query.collapsed && (
                    <Table compact size="small">
                        <tbody>{workItems}</tbody>
                    </Table>
                )}
            </>
        );
    }
}
