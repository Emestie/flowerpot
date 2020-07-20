import React from "react";
import Festival from "../helpers/Festival";

export default () => {
    const [src, top, left, width, height] = Festival.getFestivalHeaderIcon();
    if (!src) return null;

    return (
        <div style={{ position: "absolute", top: top || 8, left: left || 6, width: width || 25, height: height || 25 }}>
            <img src={src as string} alt="" />
        </div>
    );
};
