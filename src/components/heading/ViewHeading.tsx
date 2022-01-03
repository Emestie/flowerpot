import React from "react";
import { useSelector } from "react-redux";
import { Header } from "semantic-ui-react";
import { appSelector } from "../../redux/selectors/appSelectors";
import { TView } from "../../redux/types";
import { s } from "../../values/Strings";
import FestivalBanner from "./FestivalBanner";

interface P {
    children?: React.ReactNode;
    underCaption?: React.ReactNode;
    viewCaption?: string;
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
        case "info":
            return s("infoHeader");
        default:
            return viewName + "ViewHeader";
    }
};

export function ViewHeading(p: P) {
    const { view, festivalHeaderOffset, isFestivalOn } = useSelector(appSelector);

    const viewCaption = p.viewCaption || getHeaderTextByViewName(view);

    return (
        <div className="TopBar" id="ViewHeading">
            <Header as="h1" style={{ marginLeft: isFestivalOn ? festivalHeaderOffset : 0, marginBottom: 0 }}>
                {viewCaption}
            </Header>
            <div className="RightTopCorner">{p.children}</div>
            <div>{p.underCaption}</div>
            <FestivalBanner />
        </div>
    );
}
