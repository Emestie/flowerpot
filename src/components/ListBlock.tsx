import React from "react";
import { TLists } from "../helpers/Settings";
import { Input, Button, Label, Icon, Form } from "semantic-ui-react";
import { s } from "../values/Strings";
import store from "../store";
import Lists from "../helpers/Lists";
import { observer } from "mobx-react";

interface IProps {
    listName: TLists;
}
interface IState {
    inputVal: string;
    collection: string;
    collections: any[];
}

@observer
export default class ListBlock extends React.Component<IProps, IState> {
    state: IState = {
        inputVal: "",
        collection: "",
        collections: [],
    };

    componentDidMount() {
        const collections = store.settings.queries
            .map((x) => x.collectionName)
            .filter((i, v, a) => a.indexOf(i) === v)
            .map((x, i) => ({ key: i, text: x, value: x }));
        this.setState({ collections: collections, collection: collections[0] ? collections[0].value : "" });
    }

    get list() {
        return store.getList(this.props.listName);
    }

    get inputError() {
        if (this.props.listName === "permawatch") {
            return (
                (!+this.state.inputVal && this.state.inputVal !== "") ||
                Lists.isIn(this.props.listName, this.state.collection, +this.state.inputVal.trim()) ||
                this.state.inputVal.indexOf(".") !== -1 ||
                (this.state.inputVal !== "" && +this.state.inputVal < 1) ||
                this.state.inputVal.length > 7
            );
        } else return undefined;
    }

    get blockButton() {
        if (this.props.listName === "permawatch") {
            return (
                !+this.state.inputVal ||
                Lists.isIn(this.props.listName, this.state.collection, +this.state.inputVal.trim()) ||
                this.state.inputVal.indexOf(".") !== -1 ||
                (this.state.inputVal !== "" && +this.state.inputVal < 1) ||
                this.state.inputVal.length > 7
            );
        } else if (this.props.listName === "keywords") {
            return this.state.inputVal.trim() === "" || Lists.isIn(this.props.listName, "", 0, 0, this.state.inputVal.trim());
        } else return undefined;
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
            case "pinned":
                return "orange";
            case "keywords":
                return "blue";
            default:
                return undefined;
        }
    }

    onAdd = () => {
        if (this.props.listName === "permawatch") {
            Lists.push(this.props.listName, this.state.collection, +this.state.inputVal);
        } else if (this.props.listName === "keywords") {
            Lists.pushStrings(this.props.listName, this.state.inputVal);
        }
        this.setState({ inputVal: "" });
    };

    onItemDelete = (id: number, collection: string) => {
        Lists.deleteFromList(this.props.listName, id, collection);
    };

    onClear = () => {
        Lists.clearList(this.props.listName);
    };

    render() {
        let items = this.list.map((l) => (
            <span key={l.id} style={{ marginBottom: 3, marginRight: 3, display: "inline-block" }}>
                <Label color={this.color}>
                    {!!l.collection && <Label.Detail>{l.collection + "/"}</Label.Detail>}
                    {this.props.listName === "keywords" ? l.word : l.id}
                    {this.props.listName === "hidden" && (
                        <>
                            {" "}
                            <Icon name="redo" />
                            {l.rev}
                        </>
                    )}
                    <Icon name="delete" onClick={() => this.onItemDelete(l.id, l.collection || "")} />
                </Label>
            </span>
        ));

        return (
            <div>
                <br></br>
                {this.props.listName === "permawatch" ? (
                    <Form>
                        <Form.Group inline>
                            <Form.Select
                                label=""
                                options={this.state.collections}
                                value={this.state.collection}
                                onChange={(e, { value }) => {
                                    this.setState({ collection: value as string });
                                }}
                            />
                            <Form.Input
                                size="small"
                                placeholder="ID"
                                value={this.state.inputVal}
                                onChange={(e) => this.setState({ inputVal: e.target.value })}
                                error={this.inputError}
                                maxLength="7"
                            />{" "}
                            <Form.Button size="small" onClick={this.onAdd} disabled={this.blockButton}>
                                {s("add")}
                            </Form.Button>
                        </Form.Group>
                    </Form>
                ) : this.props.listName === "keywords" ? (
                    <>
                        <Input
                            size="small"
                            placeholder={s("keyword")}
                            value={this.state.inputVal}
                            onChange={(e) => this.setState({ inputVal: e.target.value })}
                            error={this.inputError}
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
                {!!items.length && (
                    <Button size="mini" onClick={this.onClear}>
                        {s("listsClearAll")}
                    </Button>
                )}
                {items}
            </div>
        );
    }
}
