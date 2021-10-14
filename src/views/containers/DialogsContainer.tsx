import React from "react";
import { s } from "../../values/Strings";
import { SingleInputColorDialog } from "../../components/dialogs/SingleInputColorDialog";
import Platform from "../../helpers/Platform";
import { queriesSorting } from "../MainView";
import Telemetry from "../../helpers/Telemetry";
import { LinkAddingDialog } from "../../components/dialogs/LinkAddingDialog";
import Notif from "../../helpers/Notif";
import { useDispatch, useSelector } from "react-redux";
import { getQueriesSelector, settingsSelector } from "../../redux/selectors/settingsSelectors";
import { appDialogSet } from "../../redux/actions/appActions";
import { appSelector } from "../../redux/selectors/appSelectors";

export function DialogsContainer() {
    const dispatch = useDispatch();
    const { dialogs } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);
    const queries = useSelector(getQueriesSelector()).sort(queriesSorting);

    const collections = queries.map((x) => x.collectionName).filter((i, v, a) => a.indexOf(i) === v);

    const openById = (id: string, color?: string, collection?: string) => {
        if (!collection) collection = "DefaultCollection";
        if (!id) {
            Notif.show(s("enterID"));
            return;
        }

        //TODO: fix qa
        Platform.current.openUrl(settings.tfsPath + collection + "/QA/_workitems?_a=edit&id=" + id);
        dispatch(appDialogSet("openById", false));
    };

    const feedbackSend = (text: string) => {
        if (text) Telemetry.sendFeedback(text);

        dispatch(appDialogSet("feedback", false));
    };

    return (
        <>
            <SingleInputColorDialog
                show={dialogs.openById}
                onClose={() => {
                    dispatch(appDialogSet("openById", false));
                }}
                onOk={openById}
                caption={s("openByIdText")}
                dropdownValues={collections}
            />
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
