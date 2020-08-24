import React from "react";
import Festival from "../helpers/Festival";
import store from "../store";

export default () => {
    const [src, top, left, width, height] = Festival.getFestivalHeaderIcon();
    if (!src) return null;
    if (src) store.isFestivalOn = true;

    return (
        <div style={{ position: "absolute", top: top || 8, left: left || 6, width: width || 25, height: height || 25 }}>
            <img src={src as string} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
};
