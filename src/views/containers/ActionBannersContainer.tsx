import React from "react";
import ActionBanner from "../../components/banners/ActionBanner";
import { IActionBannerProps } from "../../components/banners/ActionBanner";
import store from "../../store";
import { s } from "../../values/Strings";

const flowerbotImg = require("../../assets/flowerbot-av-48.png") as string;
const idea = require("../../assets/idea.png");

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
            store.dialogs.feedback = true;
        },
        img: idea,
        type: "warning",
    },
];

//! LAST USED INDEX: 4

export default () => {
    const banners = actionBannersList.map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
};
