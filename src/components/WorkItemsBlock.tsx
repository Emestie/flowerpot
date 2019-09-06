import React from "react";
import { Button, Checkbox, Icon, Table, Header, Label } from "semantic-ui-react";
import store from "../store";
import { IQuery } from "../helpers/Query";
import { observer } from "mobx-react";
import QueryTable from "./QueryTable";

interface IProps {
    query: IQuery;
}
interface IState {}

@observer
export default class WorkItemsBlock extends React.Component<IProps, IState> {
    //TODO: on load start routine and put timer in a bag
    //loadee save in LOCAL state here

    openQuerySelector = () => {
        store.switchView("selectqueries");
    };

    render() {
        let query = this.props.query;

        return (
            <>
                <Header as="h3" dividing>
                    {query.queryName}
                    <small>
                        <span style={{ marginLeft: 10, color: "gray" }}>{query.teamName}</span>
                    </small>
                    <Label size="small" circular>
                        15
                    </Label>
                    <Label size="small" circular color="orange">
                        2
                    </Label>
                    <Label size="small" circular color="red">
                        1
                    </Label>
                    <Label size="small" circular color="green">
                        ✔
                    </Label>

                    <Label size="small">Loading...</Label>
                </Header>

                <QueryTable />
            </>
        );
    }
}
