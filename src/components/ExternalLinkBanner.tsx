import React from "react";
import store from "../store";
import { Message } from "semantic-ui-react";
import Platform from "../helpers/Platform";
import { observer } from "mobx-react-lite";

interface P {
    id: number;
    text: string;
    linkText: string;
    linkUrl?: string;
    img?: string;
    type?: "negative" | "positive" | "info" | "warning";
}

export default observer((p: P) => {
    const hideMessage = () => {
        const allBanners = store.settings.bannersShown;
        store.settings.bannersShown = [...allBanners, p.id];
        store.updateSettings();
    };

    const openUrlAndHideBanner = () => {
        if (p.linkUrl) {
            Platform.current.openUrl(p.linkUrl);
        }
        hideMessage();
    };

    const bannersShown = store.settings.bannersShown;
    const isBannerShown = bannersShown.indexOf(p.id) !== -1;
    if (isBannerShown) return null;

    const types = {} as any;
    if (p.type) types[p.type] = true;

    return (
        <Message {...types}>
            {p.img && <img style={{ position: "absolute", top: 8, left: 8, height: 32, width: 32, borderRadius: "50%" }} src={p.img}></img>}
            <span style={{ marginLeft: p.img ? 32 : 5 }}>
                {p.text}
                <span className="LinkStyleButton" style={{ marginLeft: 5 }} onClick={openUrlAndHideBanner}>
                    {p.linkText}
                </span>
            </span>
        </Message>
    );
});
