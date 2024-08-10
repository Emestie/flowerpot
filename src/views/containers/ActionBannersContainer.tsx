import { ActionBanner, IActionBannerProps } from "../../components/banners/ActionBanner";
import { s } from "../../values/Strings";

//const flowerbotImg = require("../../assets/flowerbot-av-48.png").default as string;
// const idea = require("../../assets/idea.png").default;
import pull from "../../assets/pull.png";
import rocketAv48 from "../../assets/rocket-av-48.png";
import { appViewSet } from "/@/redux/actions/appActions";
import { store } from "/@/redux/store";

function getActionBannersList(): IActionBannerProps[] {
    return [
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
        {
            id: 6,
            text: s("prBanner"),
            actionText: s("prBannerAction"),
            img: pull,
            type: "info",
            action() {
                store.dispatch(appViewSet("selectprojects"));
            },
            condition() {
                return store.getState().settings.projects.length === 0;
            },
        },
    ];
}

//! LAST USED INDEX: 6

export function ActionBannersContainer() {
    const banners = getActionBannersList().map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
}
