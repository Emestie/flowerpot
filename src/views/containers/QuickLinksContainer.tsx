import { observer } from "mobx-react";
import React from "react";
import { Label } from "semantic-ui-react";
import Platform from "../../helpers/Platform";
import store from "../../store";
import { s } from "../../values/Strings";

export default observer(() => {
    const links = store.settings.links.sort((a, b) => (a.order || 0) - (b.order || 0));

    const openLink = (url: string) => {
        Platform.current.openUrl(url);
    };

    const addNew = () => {
        store.dialogs.addLink = true;
    };

    const items = links.map((x) => (
        <Label color={x.color as any} onClick={() => openLink(x.url)} size="mini" basic>
            {x.name}
        </Label>
    ));

    if (!items.length) {
        items.push(<span style={{ color: "gray", fontSize: 10, fontStyle: "italic" }}>{s("noLinks")}</span>);
    }

    if (links.length < 5) {
        items.push(
            <Label onClick={addNew} size="mini">
                +
            </Label>
        );
    }

    return (
        <div className="ql-container" style={{ textAlign: "right" }}>
            {items}
        </div>
    );
});
