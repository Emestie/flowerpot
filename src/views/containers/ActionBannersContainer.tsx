import pull from "../../assets/pull.png";
import { ActionBanner, IActionBannerProps } from "../../components/banners/ActionBanner";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { useSettingsStore } from "../../zustand/settings";
// import idea from "../../assets/idea.png";

function getActionBannersList(): IActionBannerProps[] {
    return [
        // {
        //     id: 4,
        //     text: s("feedbackAlert"),
        //     actionText: s("feedbackAlertButton"),
        //     action: () => {
        //         useAppStore.getState().setDialog("feedback", true);
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
                const state = useSettingsStore.getState();
                return state.accounts.length > 0 && state.projects.length === 0;
            },
        },
        {
            id: 8,
            text: s("statusBanner"),
            actionText: s("statusBannerAction"),
            type: "info",
            condition() {
                if (new Date().getTime() >= new Date(2026, 8, 20).getTime()) return false;
                return true;
            },
        },
    ];
}

//! LAST USED INDEX: 8

export function ActionBannersContainer() {
    const banners = getActionBannersList().map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
}
