import flexokiPalette from "../../assets/flexoki-palette.svg";
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
            id: 7,
            text: s("flexokiBannerText"),
            actionText: s("flexokiBannerAction"),
            img: flexokiPalette,
            type: "positive",
            action() {
                useSettingsStore.getState().setColorScheme("flexoki");
            },
            condition() {
                const state = useSettingsStore.getState();
                if (state.colorScheme === "flexoki") return false;
                if (Date.now() >= new Date(2026, 7, 20).getTime()) return false;
                return true;
            },
        },
    ];
}

//! LAST USED INDEX: 7

export function ActionBannersContainer() {
    const banners = getActionBannersList().map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
}
