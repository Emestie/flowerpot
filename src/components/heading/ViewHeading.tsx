import { ReactNode } from "react";
import { Header } from "semantic-ui-react";
import { TView } from "../../types";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { FestivalBanner, defaultFestivalIcon } from "./FestivalBanner";

interface P {
    children?: ReactNode;
    underCaption?: ReactNode;
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
        case "main":
            return null;
        case "selectqueries":
            return s("selQHeader");
        case "selectprojects":
            return s("selPHeader");
        case "settings":
            return s("settingsHeader");
        case "info":
            return s("infoHeader");
        default:
            return viewName + "ViewHeader";
    }
};

export function ViewHeading(p: P) {
    const view = useAppStore((state) => state.view);
    const currentFestival = useAppStore((state) => state.currentFestival);

    const viewCaption = p.viewCaption || getHeaderTextByViewName(view);

    const leftMargin = currentFestival ? currentFestival.icon.offset : defaultFestivalIcon.icon.offset;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Header as="h1" className="main-view-heading" style={{ marginLeft: leftMargin, marginBottom: 0 }}>
                    {viewCaption}
                </Header>
                <div>{p.children}</div>
            </div>
            <div>{p.underCaption}</div>
            <FestivalBanner />
        </>
    );
}
