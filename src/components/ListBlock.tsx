import React, { useEffect, useState } from "react";
import { TLists } from "../helpers/Settings";
import { Input, Button, Label, Icon, Form } from "semantic-ui-react";
import { s } from "../values/Strings";
import Lists from "../helpers/Lists";
import { useSelector } from "react-redux";
import { getListsSelector, settingsSelector } from "../redux/selectors/settingsSelectors";

interface P {
    listName: TLists;
}

export function ListBlock(p: P) {
    const [inputVal, setInputVal] = useState("");
    const [collection, setCollection] = useState("");
    const [collections, setCollections] = useState<any[]>([]);

    const settings = useSelector(settingsSelector);
    const list = useSelector(getListsSelector(p.listName));

    useEffect(() => {
        const collections = settings.queries
            .map((x) => x.collectionName)
            .filter((i, v, a) => a.indexOf(i) === v)
            .map((x, i) => ({ key: i, text: x, value: x }));

        setCollections(collections);
        setCollection(collections[0] ? collections[0].value : "");
    }, []);

    const inputError = (() => {
        if (p.listName === "permawatch") {
            return (
                (!+inputVal && inputVal !== "") ||
                Lists.isIn(p.listName, collection, +inputVal.trim()) ||
                inputVal.indexOf(".") !== -1 ||
                (inputVal !== "" && +inputVal < 1) ||
                inputVal.length > 7
            );
        } else return undefined;
    })();

    const blockButton = (() => {
        if (p.listName === "permawatch") {
            return (
                !+inputVal ||
                Lists.isIn(p.listName, collection, +inputVal.trim()) ||
                inputVal.indexOf(".") !== -1 ||
                (inputVal !== "" && +inputVal < 1) ||
                inputVal.length > 7
            );
        } else if (p.listName === "keywords") {
            return inputVal.trim() === "" || Lists.isIn(p.listName, "", 0, 0, inputVal.trim());
        } else return undefined;
    })();

    const color = (() => {
        switch (p.listName) {
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
    })();

    const onAdd = () => {
        if (p.listName === "permawatch") {
            Lists.push(p.listName, collection, +inputVal);
        } else if (p.listName === "keywords") {
            Lists.pushStrings(p.listName, inputVal);
        }
        setInputVal("");
    };

    const onItemDelete = (id: number, collection: string) => {
        Lists.deleteFromList(p.listName, id, collection);
    };

    const onClear = () => {
        Lists.clearList(p.listName);
    };

    let items = list.map((l) => (
        <span key={l.id} style={{ marginBottom: 3, marginRight: 3, display: "inline-block" }}>
            <Label color={color}>
                {!!l.collection && <Label.Detail>{l.collection + "/"}</Label.Detail>}
                {p.listName === "keywords" ? l.word : l.id}
                {p.listName === "hidden" && (
                    <>
                        {" "}
                        <Icon name="redo" />
                        {l.rev}
                    </>
                )}
                <Icon name="delete" onClick={() => onItemDelete(l.id, l.collection || "")} />
            </Label>
        </span>
    ));

    return (
        <div>
            <br></br>
            {p.listName === "permawatch" ? (
                <Form>
                    <Form.Group inline>
                        <Form.Select
                            label=""
                            options={collections}
                            value={collection}
                            onChange={(e, { value }) => {
                                setCollection(value as string);
                            }}
                        />
                        <Form.Input
                            size="small"
                            placeholder="ID"
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            error={inputError}
                            maxLength="7"
                        />{" "}
                        <Form.Button size="small" onClick={onAdd} disabled={blockButton}>
                            {s("add")}
                        </Form.Button>
                    </Form.Group>
                </Form>
            ) : p.listName === "keywords" ? (
                <>
                    <Input
                        size="small"
                        placeholder={s("keyword")}
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        error={inputError}
                    />{" "}
                    <Button size="small" onClick={onAdd} disabled={blockButton}>
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
                <Button size="mini" onClick={onClear}>
                    {s("listsClearAll")}
                </Button>
            )}
            {items}
        </div>
    );
}
