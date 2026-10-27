import pull from "../../assets/pull.png";
import { ActionBanner, IActionBannerProps } from "../../components/banners/ActionBanner";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { useSettingsStore } from "../../zustand/settings";
// import idea from "../../assets/idea.png";

/**
 * One-time promotional banners only: an id is persisted in `bannersShown` as soon
 * as the banner is dismissed, so ids are permanent and never reused. Messages
 * about app state or failures get their own component instead of an entry here
 * (see SettingsProblemBanner) — a broken settings file must be reported on every
 * launch until it is fixed, not hidden after one click.
 */
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

//! LAST USED INDEX: 8 — next banner takes a new id, existing ids are never reused

export function ActionBannersContainer() {
    const banners = getActionBannersList().map((x) => <ActionBanner key={x.id} {...x} />);

    return <>{banners}</>;
}
