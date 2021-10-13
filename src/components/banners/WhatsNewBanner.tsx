import React from "react";
import { Message, Button } from "semantic-ui-react";
import { s } from "../../values/Strings";
import Platform from "../../helpers/Platform";
import Version from "../../helpers/Version";
import { useDispatch, useSelector } from "react-redux";
import { appSelector } from "../../redux/selectors/appSelectors";
import { appSet } from "../../redux/actions/appActions";

export function WhatsNewBanner() {
    const { showWhatsNew } = useSelector(appSelector);
    const dispatch = useDispatch();

    if (!showWhatsNew) return null;

    const hideMessage = () => {
        const showWhatsNew = false;
        dispatch(appSet({ showWhatsNew }));
    };

    const showNotes = () => {
        Platform.current.openUrl("https://emestie.github.io/flowerpot/changelog");
        hideMessage();
    };

    const neverShowNotesAgain = () => {
        hideMessage();
        const showWhatsNewOnUpdate = false;
        dispatch(appSet({ showWhatsNewOnUpdate }));
    };

    return (
        <Message info size="mini">
            {s("justUpdatedMessage1")} <i>{Version.long}</i>.
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
}
