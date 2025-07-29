import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Form, Icon, Input, Label } from "semantic-ui-react";
import Lists from "../helpers/Lists";
import { TLists } from "../helpers/Settings";
import { getListsSelector } from "../redux/selectors/settingsSelectors";
import { s } from "../values/Strings";
import { AccountBadge } from "./AccountBadge";
import { CollectionSelector } from "./CollectionSelector";

interface P {
    listName: TLists;
}

export function ListBlock(p: P) {
    const [inputVal, setInputVal] = useState("");
    const [selectedCollection, setSelectedCollection] = useState<{ accountId: string; collectionName: string }>();

    const list = useSelector(getListsSelector(p.listName));

    const inputError = (() => {
        if (p.listName === "permawatch") {
            return (
                (!+inputVal && inputVal !== "") ||
                Lists.isIn(
                    selectedCollection?.accountId || "",
                    p.listName,
                    selectedCollection?.collectionName || "",
                    +inputVal.trim()
                ) ||
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
                Lists.isIn(
                    selectedCollection?.accountId || "",
                    p.listName,
                    selectedCollection?.collectionName || "",
                    +inputVal.trim()
                ) ||
                inputVal.indexOf(".") !== -1 ||
                (inputVal !== "" && +inputVal < 1) ||
                inputVal.length > 7
            );
        } else if (p.listName === "keywords") {
            return inputVal.trim() === "" || Lists.isIn("", p.listName, "", 0, 0, inputVal.trim());
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
            case "forwarded":
                return "green";
            default:
                return undefined;
        }
    })();

    const onAdd = () => {
        if (p.listName === "permawatch") {
            Lists.push(
                selectedCollection?.accountId || "",
                p.listName,
                selectedCollection?.collectionName || "",
                +inputVal
            );
        } else if (p.listName === "keywords") {
            Lists.pushStrings("", p.listName, inputVal);
        }
        setInputVal("");
    };

    const onItemDelete = (accountId: string, id: number, collection: string) => {
        Lists.deleteFromList(accountId, p.listName, id, collection);
    };

    const onClear = () => {
        Lists.clearList(p.listName);
    };

    let items = list.map((l) => (
        <span key={l.id} style={{ marginBottom: 3, marginRight: 3, display: "inline-block" }}>
            <Label color={color}>
                {!!l.accountId && <AccountBadge accountId={l.accountId} size="s" />}
                {!!l.collection && <Label.Detail>{l.collection + "/"}</Label.Detail>}
                {p.listName === "keywords" ? l.word : l.id}
                {p.listName === "hidden" && (
                    <>
                        {" "}
                        <Icon name="redo" />
                        {l.rev}
                    </>
                )}
                <Icon
                    name="delete"
                    onClick={() => {
                        onItemDelete(l.accountId, l.id, l.collection || "");
                    }}
                />
            </Label>
        </span>
    ));

    return (
        <div>
            <br></br>
            {p.listName === "permawatch" ? (
                <Form>
                    <Form.Group inline>
                        <CollectionSelector
                            onChange={({ accountId, collectionName }) =>
                                setSelectedCollection({ accountId, collectionName })
                            }
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
