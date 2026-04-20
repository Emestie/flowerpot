import { useEffect, useState } from "react";
import { Message } from "semantic-ui-react";
import { LinkAddingDialog } from "../../components/dialogs/LinkAddingDialog";
import { OpenByIdDialog } from "../../components/dialogs/OpenByIdDialog";
import { SingleInputColorDialog } from "../../components/dialogs/SingleInputColorDialog";
import Platform from "../../helpers/Platform";
import Telemetry from "../../helpers/Telemetry";
import { b64Decode, b64Encode } from "../../modules/b64encoding/encoding";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { useSettingsStore } from "../../zustand/settings";

export function DialogsContainer() {
    const dialogs = useAppStore((state) => state.dialogs);
    const setDialog = useAppStore((state) => state.setDialog);

    const [feedbackStatus, setFeedbackStatus] = useState<{ success: boolean; reason?: string } | null>(null);

    useEffect(() => {
        if (feedbackStatus) {
            const timer = setTimeout(() => setFeedbackStatus(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedbackStatus]);

    const feedbackSend = async (text: string) => {
        if (text) {
            const success = await Telemetry.sendFeedback(text);
            setFeedbackStatus({ success, reason: success ? undefined : "Network error" });
        } else {
            setFeedbackStatus({ success: false, reason: "Empty feedback" });
        }

        setDialog("feedback", false);
    };

    return (
        <>
            <OpenByIdDialog show={dialogs.openById} />
            <SingleInputColorDialog
                show={dialogs.feedback}
                onClose={() => {
                    setDialog("feedback", false);
                }}
                onOk={feedbackSend}
                caption={s("feedbackWindowCaption")}
                area
            />
            {feedbackStatus && (
                <Message
                    positive={feedbackStatus.success}
                    error={!feedbackStatus.success}
                    style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999 }}
                >
                    {feedbackStatus.success ? s("feedbackSent") : s("feedbackFailed")}
                    {feedbackStatus.reason && (
                        <div style={{ fontSize: "0.8em", marginTop: 5 }}>{feedbackStatus.reason}</div>
                    )}
                </Message>
            )}
            <SingleInputColorDialog
                show={dialogs.exportSettings}
                onClose={() => {
                    setDialog("exportSettings", false);
                }}
                onOk={(text) => {
                    Platform.current.copyString(text);
                    setDialog("exportSettings", false);
                }}
                caption={s("exportSettingsWindowCaption")}
                area
                initialText={b64Encode(JSON.stringify(useSettingsStore.getState()))}
                unlimitedLength
                readonly
            />
            <SingleInputColorDialog
                show={dialogs.importSettings}
                onClose={() => {
                    setDialog("importSettings", false);
                }}
                onOk={(text) => {
                    try {
                        const parsedSettings = JSON.parse(b64Decode(text));
                        if (typeof parsedSettings !== "object") throw new Error("Not an object");
                        if (!parsedSettings.accounts && !Array.isArray(parsedSettings.accounts))
                            throw new Error("Invalid settings object");

                        setDialog("importSettings", false);
                        useSettingsStore.getState().setSettings(parsedSettings);
                    } catch (e: any) {
                        alert("Settings import error: " + e.message);
                    }
                }}
                caption={s("importSettingsWindowCaption")}
                area
                unlimitedLength
            />
            <LinkAddingDialog
                show={dialogs.addLink}
                onClose={() => {
                    setDialog("addLink", false);
                }}
            />
            <div id="messagePoint"></div>
        </>
    );
}
