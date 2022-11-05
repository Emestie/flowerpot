import React from "react";
import { ActionBanner } from "../../components/banners/ActionBanner";
import { IActionBannerProps } from "../../components/banners/ActionBanner";
import { s } from "../../values/Strings";

//const flowerbotImg = require("../../assets/flowerbot-av-48.png").default as string;
// const idea = require("../../assets/idea.png").default;
import rocketAv48 from "../../assets/rocket-av-48.png";

const actionBannersList: IActionBannerProps[] = [
    // {
    //     id: 1,
    //     text: s("flowerbotBanner1"),
    //     actionText: s("flowerbotBanner2"),
    //     openUrl: "https://emestie.github.io/flowerpot/bot",
    //     img: flowerbotImg,
    //     type: "positive",
    // },
    // {
    //     id: 4,
    //     text: s("feedbackAlert"),
    //     actionText: s("feedbackAlertButton"),
    //     action: () => {
    //         store.dispatch(appDialogSet("feedback", true));
    //     },
    //     img: idea,
    //     type: "warning",
    // },
    {
        id: 5,
        text: s("rocketBanner1"),
        actionText: s("rocketBanner2"),
        openUrl: "https://emestie.github.io/rocket",
        img: rocketAv48,
        type: "positive",
    },
];

//! LAST USED INDEX: 5

export function ActionBannersContainer() {
    const banners = actionBannersList.map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
}
