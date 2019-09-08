import React from "react";
import { Header, Label, Table } from "semantic-ui-react";
import store from "../store";
import { IQuery } from "../helpers/Query";
import { observer } from "mobx-react";
import { reaction } from "mobx";
import WorkItemRow from "./WorkItemRow";
import WorkItem, { IWorkItem } from "../helpers/WorkItem";

interface IProps {
    query: IQuery;
}
interface IState {
    n: number;
    workItems: IWorkItem[];
    isLoading: boolean;
}

@observer
export default class WorkItemsBlock extends React.Component<IProps, IState> {
    state: IState = { n: 0, workItems: [], isLoading: false };

    private onRoutinesRestart = reaction(() => store._routinesRestart, () => this.routineStart());
    private interval: NodeJS.Timeout | undefined;

    componentDidMount() {
        this.routineStart();
    }

    routineStart = () => {
        this.setState({ workItems: [], isLoading: true });
        //TODO: first load
        if (this.interval) clearInterval(this.interval);
        this.loadWorkItems();

        this.interval = setInterval(() => {
            this.loadWorkItems();
            this.setState({ n: this.state.n + 1 });
        }, store.settings.refreshRate * 1000);
    };

    loadWorkItems = async () => {
        //let wi = await Loaders.loadWorkItems(this.props.query);
        this.setState({ workItems: [WorkItem.fish(), WorkItem.fish()], isLoading: false });
    };

    get totalItems() {
        return this.state.workItems.length;
    }

    get redItems() {
        return this.state.workItems.filter(wi => wi.promptness === 1 || wi.rank === 1).length;
    }

    get orangeItems() {
        return this.state.workItems.filter(wi => wi.promptness === 2).length;
    }

    render() {
        let query = this.props.query;
        //TODO: sort
        let workItems = this.state.workItems /*.sort((a,b) => a.promptness - b.promptness)*/
            .map(wi => <WorkItemRow key={wi.id} item={wi} />);

        return (
            <>
                <Header as="h3" dividing>
                    {query.queryName}
                    <small>
                        <span style={{ marginLeft: 10, color: "gray" }}>{query.teamName}</span>
                    </small>
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
                    {!this.totalItems && (
                        <Label size="small" circular color="green">
                            ✔
                        </Label>
                    )}
                    {this.state.isLoading && <Label size="small">Loading...</Label>}
                </Header>
                <Table compact size="small">
                    {workItems}
                </Table>
            </>
        );
    }
}
