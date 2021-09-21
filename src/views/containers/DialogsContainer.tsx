import { observer } from "mobx-react";
import React from "react";
import { s } from "../../values/Strings";
import SingleInputColorDialog from "../../components/dialogs/SingleInputColorDialog";
import Platform from "../../helpers/Platform";
import store from "../../store";
import { queriesSorting } from "../MainView";
import Telemetry from "../../helpers/Telemetry";
import LinkAddingDialog from "../../components/dialogs/LinkAddingDialog";
import Notif from "../../helpers/Notif";

export default observer(() => {
    const queries = store.getQueries().sort(queriesSorting);
    const collections = queries.map((x) => x.collectionName).filter((i, v, a) => a.indexOf(i) === v);

    const openById = (id: string, color?: string, collection?: string) => {
        if (!collection) collection = "DefaultCollection";
        if (!id) {
            Notif.show(s("enterID"));
            return;
        }

        Platform.current.openUrl(store.settings.tfsPath + collection + "/QA/_workitems?_a=edit&id=" + id);
        store.dialogs.openById = false;
    };

    const feedbackSend = (text: string) => {
        if (text) Telemetry.sendFeedback(text);

        store.dialogs.feedback = false;
    };

    return (
        <>
            <SingleInputColorDialog
                show={store.dialogs.openById}
                onClose={() => {
                    store.dialogs.openById = false;
                }}
                onOk={openById}
                caption={s("openByIdText")}
                dropdownValues={collections}
            />
            <SingleInputColorDialog
                show={store.dialogs.feedback}
                onClose={() => {
                    store.dialogs.feedback = false;
                }}
                onOk={feedbackSend}
                caption={s("feedbackWindowCaption")}
                area={true}
            />
            <LinkAddingDialog
                show={store.dialogs.addLink}
                onClose={() => {
                    store.dialogs.addLink = false;
                }}
            />
            <div id="messagePoint"></div>
        </>
    );
});
