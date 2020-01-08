import React from "react";

const santaHat = require("../assets/santa-hat.svg") as string;

const getSrc = () => {
    const now = new Date();

    const day = now.getDate();
    const month = now.getMonth() + 1;

    if ((month === 1 && day <= 8) || (month === 12 && day >= 20)) return santaHat;

    return null;
};

export default () => {
    const src = getSrc();
    if (!src) return null;

    return (
        <div className="FestivalBannerContainer">
            <img src={santaHat} alt="" />
        </div>
    );
};
