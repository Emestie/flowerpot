import React from "react";
import { Header, Label, Table, Icon } from "semantic-ui-react";
import store from "../store";
import Query, { IQuery } from "../helpers/Query";
import { observer } from "mobx-react";
import WorkItemRow from "./WorkItemRow";
import { IWorkItem } from "../helpers/WorkItem";
import Loaders from "../helpers/Loaders";
import Electron from "../helpers/Electron";
import { s } from "../values/Strings";
import Lists from "../helpers/Lists";
import { reaction } from "mobx";

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

    private onRoutinesRestart = reaction(() => store._routinesRestart, () => this.routineStart());
    private onPermawatchUpdate = reaction(
        () => store._permawatchUpdate,
        () => {
            if (this.props.query.queryId === "___permawatch") this.loadWorkItemsForThisQuery();
        }
    );

    componentWillUnmount() {
        store.clearInterval(this.props.query);
    }

    componentDidMount() {
        this.routineStart();
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

    get isPermawatch() {
        return this.props.query.queryId === "___permawatch";
    }

    get totalItems() {
        return this.state.workItems.filter(wi => !Lists.isIn("hidden", wi.id, wi.rev)).length;
    }

    get redItems() {
        return this.state.workItems.filter(wi => !Lists.isIn("hidden", wi.id, wi.rev)).filter(wi => wi.promptness === 1 || wi.rank === 1).length;
    }

    get orangeItems() {
        return this.state.workItems.filter(wi => !Lists.isIn("hidden", wi.id, wi.rev)).filter(wi => wi.promptness === 2).length;
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

        let encodedPath = encodeURI(q.queryPath)
            .replace("/", "%2F")
            .replace("&", "%26");

        Electron.openUrl(store.settings.tfsPath + q.teamName + "/_workItems?path=" + encodedPath + "&_a=query");
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

    sortByLists(a: IWorkItem, b: IWorkItem) {
        if (a.list === "deferred" && b.list !== "deferred") return 1;
        else if (a.list !== "deferred" && b.list === "deferred") return -1;

        if (a.list === "favorites" && b.list !== "favorites") return -1;
        else if (a.list !== "favorites" && b.list === "favorites") return 1;

        if (store.settings.mineOnTop) {
            if (a.isMine && !b.isMine) return -1;
            else if (!a.isMine && b.isMine) return 1;
        }

        return undefined;
    }

    sortPatternDefault = (a: IWorkItem, b: IWorkItem) => {
        let listRes = this.sortByLists(a, b);
        if (listRes) return listRes;

        if (a.weight < b.weight) return -1;
        else if (a.weight > b.weight) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    sortPatternAssignedTo = (a: IWorkItem, b: IWorkItem) => {
        let listRes = this.sortByLists(a, b);
        if (listRes) return listRes;

        if (a.assignedTo < b.assignedTo) return -1;
        else if (a.assignedTo > b.assignedTo) return 1;

        if (a.createdDate < b.createdDate) return -1;
        else return 1;
    };

    sortPatternId = (a: IWorkItem, b: IWorkItem) => {
        let listRes = this.sortByLists(a, b);
        if (listRes) return listRes;

        if (a.id < b.id) return -1;
        else return 1;
    };

    dropAllWiChanges = () => {
        this.state.workItems.forEach(wi => {
            store.setWIHasChanges(wi, false);
        });
    };

    updateWorkItems = (wi: IWorkItem) => {
        let newList = this.state.workItems.filter(w => w.id !== wi.id);
        newList.push(wi);
        this.setState({ workItems: newList });
    };

    render() {
        let query = this.props.query;
        let workItems = this.state.workItems
            .sort(this.getSortPattern())
            .filter(wi => !Lists.isIn("hidden", wi.id, wi.rev))
            .map(wi => <WorkItemRow key={wi.id} item={wi} isPermawatch={this.isPermawatch} onUpdate={this.updateWorkItems} />);

        let iconCollapse = query.collapsed ? <Icon name="angle right" /> : <Icon name="angle down" />;

        return (
            <>
                <Header as="h3" dividing>
                    {!this.state.isLoading && !!this.state.workItems.length && !this.isPermawatch && (
                        <span onClick={this.onCollapseClick}>{iconCollapse}</span>
                    )}
                    <span onClick={this.dropAllWiChanges}>
                        <span className={query.queryPath ? "WorkItemLink" : ""} onClick={this.onQueryNameClick}>
                            {this.isPermawatch && (
                                <span>
                                    <Icon name="eye" />
                                </span>
                            )}
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
                    {this.state.isLoading && <Label size="small">{s("loading")}</Label>}
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
