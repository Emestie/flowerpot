import { Message, Button } from "semantic-ui-react";
import { s } from "../../values/Strings";
import Version from "../../helpers/Version";
import { useAppStore } from "../../zustand/app";

export function WhatsNewBanner() {
    const showWhatsNew = useAppStore((state) => state.showWhatsNew);

    if (!showWhatsNew) return null;

    const hideMessage = () => {
        useAppStore.getState().setShowWhatsNew(false);
    };

    const showNotes = () => {
        useAppStore.getState().setView("info", { viewCaption: s("releaseNotes"), contentFileName: "changelog.md" });
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
