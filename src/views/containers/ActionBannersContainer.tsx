import pull from "../../assets/pull.png";
import { ActionBanner, IActionBannerProps } from "../../components/banners/ActionBanner";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { store } from "/@/redux/store";
// import idea from "../../assets/idea.png";

function getActionBannersList(): IActionBannerProps[] {
    return [
        // {
        //     id: 4,
        //     text: s("feedbackAlert"),
        //     actionText: s("feedbackAlertButton"),
        //     action: () => {
        //         store.dispatch(appDialogSet("feedback", true));
        //     },
        //     condition() {
        //         return Platform.type === PlatformType.Web;
        //     },
        //     img: idea,
        //     type: "warning",
        // },
        {
            id: 6,
            text: s("prBanner"),
            actionText: s("prBannerAction"),
            img: pull,
            type: "info",
            action() {
                useAppStore.getState().setView("selectprojects");
            },
            condition() {
                return store.getState().settings.accounts.length > 0 && store.getState().settings.projects.length === 0;
            },
        },
    ];
}

//! LAST USED INDEX: 6

export function ActionBannersContainer() {
    const banners = getActionBannersList().map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
}
