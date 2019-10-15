import React from "react";
import store from "../store";
import { Message, Button } from "semantic-ui-react";
import { s } from "../values/Strings";
import Electron from "../helpers/Electron";
import { observer } from "mobx-react-lite";

export default observer(() => {
    if (!store.showWhatsNew) return null;

    const hideMessage = () => {
        store.showWhatsNew = false;
    };

    const showNotes = () => {
        Electron.openUrl("https://emestie.github.io/flowerpot/changelog");
        hideMessage();
    };

    const neverShowNotesAgain = () => {
        hideMessage();
        store.settings.showWhatsNewOnUpdate = false;
        store.updateSettings();
    };

    return (
        <Message info size="mini">
            {s("justUpdatedMessage1")} <i>{Electron.getVer()}</i>.
            <span style={{ marginLeft: 10 }}>
                <Button compact size="mini" onClick={showNotes}>
                    {s("justUpdatedMessage2")}
                </Button>
                <Button compact size="mini" onClick={hideMessage}>
                    {s("justUpdatedHide")}
                </Button>
                <span className="LinkStyleButton" style={{ marginLeft: 5 }} onClick={neverShowNotesAgain}>
                    {s("justUpdatedNeverShow")}
                </span>
            </span>
        </Message>
    );
});
