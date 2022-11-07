import { Message, Button } from "semantic-ui-react";
import { s } from "../../values/Strings";
import Version from "../../helpers/Version";
import { useDispatch, useSelector } from "react-redux";
import { appSelector } from "../../redux/selectors/appSelectors";
import { appSet, appViewSet } from "../../redux/actions/appActions";

export function WhatsNewBanner() {
    const { showWhatsNew } = useSelector(appSelector);
    const dispatch = useDispatch();

    if (!showWhatsNew) return null;

    const hideMessage = () => {
        const showWhatsNew = false;
        dispatch(appSet({ showWhatsNew }));
    };

    const showNotes = () => {
        dispatch(appViewSet("info", { viewCaption: s("releaseNotes"), contentFileName: "changelog.md" }));
        hideMessage();
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
            </span>
        </Message>
    );
}
