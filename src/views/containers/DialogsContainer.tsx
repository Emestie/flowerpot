import { useDispatch, useSelector } from "react-redux";
import { LinkAddingDialog } from "../../components/dialogs/LinkAddingDialog";
import { OpenByIdDialog } from "../../components/dialogs/OpenByIdDialog";
import { SingleInputColorDialog } from "../../components/dialogs/SingleInputColorDialog";
import Telemetry from "../../helpers/Telemetry";
import { appDialogSet } from "../../redux/actions/appActions";
import { appSelector } from "../../redux/selectors/appSelectors";
import { s } from "../../values/Strings";

export function DialogsContainer() {
    const dispatch = useDispatch();
    const { dialogs } = useSelector(appSelector);

    const feedbackSend = (text: string) => {
        if (text) Telemetry.sendFeedback(text);

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
                area={true}
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
