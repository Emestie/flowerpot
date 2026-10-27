import { Message } from "../../ui/message";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { useSettingsStore } from "../../zustand/settings";

export interface IActionBannerProps {
    id: number;
    text: string;
    actionText: string;
    dismissText?: string;
    openUrl?: string;
    action?: () => void;
    img?: string;
    type?: "negative" | "positive" | "info" | "warning";
    condition?: () => boolean;
}

/**
 * A one-time announcement: once dismissed, its id is stored in `bannersShown`
 * and the banner never appears again — which is why an id must never be reused.
 *
 * Use it for promotional / one-off messages only. Anything that reflects live
 * app state or a fault (a new version, a damaged settings file) belongs in its
 * own component — see WhatsNewBanner, UpdateBanner, SettingsProblemBanner —
 * because such a message has to stay visible until the problem is actually gone
 * and must not be silenced forever by one click.
 */
export function ActionBanner(p: IActionBannerProps) {
    const bannersShown = useSettingsStore((state) => state.bannersShown);

    const hideMessage = () => {
        useSettingsStore.getState().setSettings({ bannersShown: [...bannersShown, p.id] });
    };

    const doActionAndHideBanner = () => {
        if (p.openUrl) Platform.current.openUrl(p.openUrl);
        if (p.action) p.action();

        hideMessage();
    };

    const isBannerShown = bannersShown.indexOf(p.id) !== -1;
    const cantShow = p.condition?.() === false;

    if (isBannerShown || cantShow) return null;

    const types = {} as any;
    if (p.type) types[p.type] = true;

    return (
        <Message {...types}>
            {p.img && <img alt="" className="banner-img" src={p.img}></img>}
            <span style={{ marginLeft: p.img ? 32 : 5 }}>
                {p.text}

                <span className="LinkStyleButton ml-20 font-bold" onClick={doActionAndHideBanner}>
                    {p.actionText}
                </span>
                <span className="LinkStyleButton ml-20" onClick={hideMessage}>
                    {p.dismissText ?? s("hideBanner")}
                </span>
            </span>
        </Message>
    );
}
