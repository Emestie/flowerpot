import React from "react";
import { TLists } from "../helpers/Settings";
import { Input, Button, Form, Label, Icon } from "semantic-ui-react";
import { s } from "../values/Strings";
import store from "../store";
import Lists from "../helpers/Lists";
import { observer } from "mobx-react";

interface IProps {
    list: TLists;
}
interface IState {
    inputVal: string;
}

@observer
export default class ListBlock extends React.Component<IProps, IState> {
    state: IState = {
        inputVal: ""
    };

    get list() {
        return store.getList(this.props.list);
    }

    get inputError() {
        return (
            (!+this.state.inputVal && this.state.inputVal !== "") ||
            this.list.indexOf(+this.state.inputVal.trim()) !== -1 ||
            this.state.inputVal.indexOf(".") !== -1 ||
            (this.state.inputVal !== "" && +this.state.inputVal < 1) ||
            this.state.inputVal.length > 7
        );
    }

    get blockButton() {
        return (
            !+this.state.inputVal ||
            this.list.indexOf(+this.state.inputVal.trim()) !== -1 ||
            this.state.inputVal.indexOf(".") !== -1 ||
            (this.state.inputVal !== "" && +this.state.inputVal < 1) ||
            this.state.inputVal.length > 7
        );
    }

    get color() {
        switch (this.props.list) {
            case "deferred":
                return "grey";
            case "permawatch":
                return "pink";
            case "hidden":
                return undefined;
            case "favorites":
                return "purple";
        }
    }

    onAdd = () => {
        Lists.push(this.props.list, +this.state.inputVal);
        this.setState({ inputVal: "" });
    };

    onItemDelete = (id: number) => {
        Lists.deleteFromList(this.props.list, id);
    };

    render() {
        let items = this.list.map(l => (
            <span style={{ marginBottom: 3, marginRight: 3, display: "inline-block" }}>
                <Label as="a" color={this.color}>
                    {l}
                    <Icon name="delete" onClick={() => this.onItemDelete(l)} />
                </Label>
            </span>
        ));

        return (
            <div>
                <br></br>
                <Input
                    size="small"
                    placeholder="ID"
                    value={this.state.inputVal}
                    onChange={e => this.setState({ inputVal: e.target.value })}
                    error={this.inputError}
                    maxLength="7"
                />{" "}
                <Button size="small" onClick={this.onAdd} disabled={this.blockButton}>
                    {s("add")}
                </Button>
                <br />
                <br />
                {items}
            </div>
        );
    }
}
