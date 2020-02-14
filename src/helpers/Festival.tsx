import React from "react";
import store from "../store";

const santaHat = require("../assets/santa-hat.svg") as string;
const feb23 = require("../assets/feb23.svg") as string;
const mar8 = require("../assets/mar8.svg") as string;

export enum Eve {
    NewYear,
    Feb23,
    Mar8,
    Apr1,
}

export default class Festival {
    private static getHumanDate() {
        const now = new Date();

        const day = now.getDate();
        const month = now.getMonth() + 1;

        return [day, month];
    }

    private static isEveNow(eve: Eve) {
        const [day, month] = this.getHumanDate();

        switch (eve) {
            case Eve.NewYear:
                return (month === 1 && day <= 8) || (month === 12 && day >= 20);
            case Eve.Feb23:
                return month === 2 && day === 21;
            case Eve.Mar8:
                return month === 3 && day === 6;
            default:
                return false;
        }
    }

    public static getFestivalHeaderIcon() {
        if (this.isEveNow(Eve.NewYear)) return santaHat;
        if (this.isEveNow(Eve.Feb23)) return feb23;
        if (this.isEveNow(Eve.Mar8)) return mar8;

        return null;
    }

    public static getFestivalNameBanner(name: string, nameFull: string) {
        if (this.isEveNow(Eve.Mar8) && (name.includes("Грамович") || name.includes("Якубовская") || name.includes("Селихова"))) {
            const flower1 = require("../assets/flower1.svg") as string;
            const flower2 = require("../assets/flower2.svg") as string;
            const flower3 = require("../assets/flower3.svg") as string;

            let src = name.includes("Грамович") ? flower1 : name.includes("Якубовская") ? flower3 : flower2;

            let addition = <img style={{ width: 16, height: 16, marginRight: 3 }} src={src} alt="" />;

            return (
                <span style={{ color: store.settings.darkTheme ? "pink" : "#ca639b" }} title={nameFull}>
                    {addition}
                    {name}
                </span>
            );
        }

        return null;
    }
}
