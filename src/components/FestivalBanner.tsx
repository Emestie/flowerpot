import React from "react";
import Festival from "../helpers/Festival";

export default () => {
    const src = Festival.getFestivalHeaderIcon();
    if (!src) return null;

    return (
        <div className="FestivalBannerContainer">
            <img src={src} alt="" />
        </div>
    );
};
