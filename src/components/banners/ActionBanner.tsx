import { useDispatch, useSelector } from "react-redux";
import { Message } from "semantic-ui-react";
import Platform from "../../helpers/Platform";
import { settingsUpdate } from "../../redux/actions/settingsActions";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";

export interface IActionBannerProps {
    id: number;
    text: string;
    actionText: string;
    openUrl?: string;
    action?: () => void;
    img?: string;
    type?: "negative" | "positive" | "info" | "warning";
    condition?: () => boolean;
}

export function ActionBanner(p: IActionBannerProps) {
    const settings = useSelector(settingsSelector);
    const dispatch = useDispatch();

    const hideMessage = () => {
        const allBanners = settings.bannersShown;
        const bannersShown = [...allBanners, p.id];
        dispatch(settingsUpdate({ bannersShown }));
    };

    const doActionAndHideBanner = () => {
        if (p.openUrl) Platform.current.openUrl(p.openUrl);
        if (p.action) p.action();

        hideMessage();
    };

    const bannersShown = settings.bannersShown;
    const isBannerShown = bannersShown.indexOf(p.id) !== -1;
    const cantShow = p.condition?.() === false;

    if (isBannerShown || cantShow) return null;

    const types = {} as any;
    if (p.type) types[p.type] = true;

    return (
        <Message {...types}>
            {p.img && (
                <img
                    alt=""
                    style={{ position: "absolute", top: 8, left: 8, height: 32, width: 32, borderRadius: "50%" }}
                    src={p.img}
                ></img>
            )}
            <span style={{ marginLeft: p.img ? 32 : 5 }}>
                {p.text}

                <span
                    className="LinkStyleButton"
                    style={{ marginLeft: 20, fontWeight: "bold" }}
                    onClick={doActionAndHideBanner}
                >
                    {p.actionText}
                </span>
                <span className="LinkStyleButton" style={{ marginLeft: 20 }} onClick={hideMessage}>
                    {s("hideBanner")}
                </span>
            </span>
        </Message>
    );
}
