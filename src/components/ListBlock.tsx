import React from "react";
import { TLists } from "../helpers/Settings";
import { Input, Button, Label, Icon } from "semantic-ui-react";
import { s } from "../values/Strings";
import store from "../store";
import Lists from "../helpers/Lists";
import { observer } from "mobx-react";

interface IProps {
    listName: TLists;
}
interface IState {
    inputVal: string;
}

@observer
export default class ListBlock extends React.Component<IProps, IState> {
    state: IState = {
        inputVal: "",
    };

    get list() {
        return store.getList(this.props.listName);
    }

    get inputError() {
        return (
            (!+this.state.inputVal && this.state.inputVal !== "") ||
            Lists.isIn(this.props.listName, +this.state.inputVal.trim()) ||
            this.state.inputVal.indexOf(".") !== -1 ||
            (this.state.inputVal !== "" && +this.state.inputVal < 1) ||
            this.state.inputVal.length > 7
        );
    }

    get blockButton() {
        return (
            !+this.state.inputVal ||
            Lists.isIn(this.props.listName, +this.state.inputVal.trim()) ||
            this.state.inputVal.indexOf(".") !== -1 ||
            (this.state.inputVal !== "" && +this.state.inputVal < 1) ||
            this.state.inputVal.length > 7
        );
    }

    get color() {
        switch (this.props.listName) {
            case "deferred":
                return "grey";
            case "permawatch":
                return "pink";
            case "hidden":
                return undefined;
            case "favorites":
                return "purple";
            default:
                return undefined;
        }
    }

    onAdd = () => {
        Lists.push(this.props.listName, +this.state.inputVal);
        this.setState({ inputVal: "" });
    };

    onItemDelete = (id: number) => {
        Lists.deleteFromList(this.props.listName, id);
    };

    render() {
        let items = this.list.map(l => (
            <span key={l.id} style={{ marginBottom: 3, marginRight: 3, display: "inline-block" }}>
                <Label color={this.color}>
                    {l.id}
                    {this.props.listName === "hidden" && (
                        <>
                            {" "}
                            <Icon name="redo" />
                            {l.rev}
                        </>
                    )}
                    <Icon name="delete" onClick={() => this.onItemDelete(l.id)} />
                </Label>
            </span>
        ));

        return (
            <div>
                <br></br>
                {this.props.listName === "permawatch" ? (
                    <>
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
                    </>
                ) : (
                    <span>
                        <i>{s("addItemsInListNotice")}</i>
                    </span>
                )}
                <br />
                <br />
                {items}
            </div>
        );
    }
}
