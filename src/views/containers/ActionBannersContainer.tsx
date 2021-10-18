import React from "react";
import { ActionBanner } from "../../components/banners/ActionBanner";
import { IActionBannerProps } from "../../components/banners/ActionBanner";
import { appDialogSet } from "../../redux/actions/appActions";
import { store } from "../../redux/store";
import { s } from "../../values/Strings";

const flowerbotImg = require("../../assets/flowerbot-av-48.png").default as string;
const idea = require("../../assets/idea.png").default;

const actionBannersList: IActionBannerProps[] = [
    {
        id: 1,
        text: s("flowerbotBanner1"),
        actionText: s("flowerbotBanner2"),
        openUrl: "https://emestie.github.io/flowerpot/bot",
        img: flowerbotImg,
        type: "positive",
    },
    {
        id: 4,
        text: s("feedbackAlert"),
        actionText: s("feedbackAlertButton"),
        action: () => {
            store.dispatch(appDialogSet("feedback", true));
        },
        img: idea,
        type: "warning",
    },
];

//! LAST USED INDEX: 4

export function ActionBannersContainer() {
    const banners = actionBannersList.map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
}