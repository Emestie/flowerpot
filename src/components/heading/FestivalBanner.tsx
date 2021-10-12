import React from "react";
import Festival from "../../helpers/Festival";
import store from "../../store-mbx";

export default React.memo(() => {
    const [src, top, left, width, height, headerOffset, altText] = Festival.getFestivalHeaderIcon();
    if (!src) return null;
    if (src) {
        store.isFestivalOn = true;
        store.festivalHeaderOffset = headerOffset ? +headerOffset : 40;
    }

    return (
        <div style={{ position: "absolute", top: top || 8, left: left || 6, width: width || 25, height: height || 25 }}>
            <img src={src as string} alt={altText || ""} style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </div>
    );
});
