import Version from "../../helpers/Version";
import { Button } from "../../ui/button";
import { Message } from "../../ui/message";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { VersionPlantArt } from "../VersionPlantArt";

export function WhatsNewBanner() {
    const showWhatsNew = useAppStore((state) => state.showWhatsNew);

    //if (!showWhatsNew) return null;

    const hideMessage = () => {
        useAppStore.getState().setShowWhatsNew(false);
    };

    const showNotes = () => {
        useAppStore.getState().setView("info", { viewCaption: s("releaseNotes"), contentFileName: "changelog.md" });
        hideMessage();
    };

    const plant = Version.plant;

    return (
        <Message size="mini" className="whatsnew-banner">
            <VersionPlantArt className="whatsnew-plant-art" />
            <div className="whatsnew-body">
                {s("justUpdatedMessage1")} <i>{Version.number}</i>
                {plant ? <> · {plant.name}</> : null}.
            </div>
            <span className="whatsnew-buttons">
                <Button compact onClick={showNotes}>
                    {s("justUpdatedMessage2")}
                </Button>
                <Button compact onClick={hideMessage}>
                    {s("justUpdatedHide")}
                </Button>
            </span>
        </Message>
    );
}
