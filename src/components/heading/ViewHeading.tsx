import React from "react";
import { Header } from "semantic-ui-react";
import { s } from "../../values/Strings";
import store, { TView } from "../../store";
import { observer } from "mobx-react-lite";
import FestivalBanner from "./FestivalBanner";

interface P {
    children?: React.ReactNode;
}

const getHeaderTextByViewName = (viewName: TView) => {
    switch (viewName) {
        case "credentials":
            return s("tfsHeader");
        case "debug":
            return "DebugView";
        case "error":
            return s("errorHeader");
        case "lists":
            return s("listsHeader");
        case "main":
            return s("mainHeader");
        case "selectqueries":
            return s("selQHeader");
        case "settings":
            return s("settingsHeader");
        default:
            return viewName + "ViewHeader";
    }
};

export default observer((p: P) => {
    return (
        <div className="TopBar">
            <Header as="h1" style={{ marginLeft: store.isFestivalOn ? store.festivalHeaderOffset : 0 }}>
                {getHeaderTextByViewName(store.view)}
            </Header>
            <div className="RightTopCorner">{p.children}</div>
            <FestivalBanner />
        </div>
    );
});
