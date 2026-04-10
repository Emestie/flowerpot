import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Message } from "semantic-ui-react";
import { LinkAddingDialog } from "../../components/dialogs/LinkAddingDialog";
import { OpenByIdDialog } from "../../components/dialogs/OpenByIdDialog";
import { SingleInputColorDialog } from "../../components/dialogs/SingleInputColorDialog";
import Platform from "../../helpers/Platform";
import Telemetry from "../../helpers/Telemetry";
import { b64Decode, b64Encode } from "../../modules/b64encoding/encoding";
import { appDialogSet } from "../../redux/actions/appActions";
import { settingsSet } from "../../redux/actions/settingsActions";
import { appSelector } from "../../redux/selectors/appSelectors";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";

export function DialogsContainer() {
    const dispatch = useDispatch();
    const { dialogs } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);

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

        dispatch(appDialogSet("feedback", false));
    };

    return (
        <>
            <OpenByIdDialog show={dialogs.openById} />
            <SingleInputColorDialog
                show={dialogs.feedback}
                onClose={() => {
                    dispatch(appDialogSet("feedback", false));
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
                    dispatch(appDialogSet("exportSettings", false));
                }}
                onOk={(text) => {
                    Platform.current.copyString(text);
                    dispatch(appDialogSet("exportSettings", false));
                }}
                caption={s("exportSettingsWindowCaption")}
                area
                initialText={b64Encode(JSON.stringify(settings))}
                unlimitedLength
                readonly
            />
            <SingleInputColorDialog
                show={dialogs.importSettings}
                onClose={() => {
                    dispatch(appDialogSet("importSettings", false));
                }}
                onOk={(text) => {
                    try {
                        const settings = JSON.parse(b64Decode(text));
                        if (typeof settings !== "object") throw new Error("Not an object");
                        if (!settings.accounts && !Array.isArray(settings.accounts))
                            throw new Error("Invalid settings object");

                        dispatch(appDialogSet("importSettings", false));
                        dispatch(settingsSet(settings));
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
                    dispatch(appDialogSet("addLink", false));
                }}
            />
            <div id="messagePoint"></div>
        </>
    );
}
