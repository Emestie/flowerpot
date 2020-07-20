import React from "react";
import store from "../store";
import { IWorkItem } from "./WorkItem";
import { Icon } from "semantic-ui-react";

const santaHat = require("../assets/santa-hat.svg") as string;
const feb23 = require("../assets/feb23.svg") as string;
const mar8 = require("../assets/mar8.svg") as string;
const coronavirus = require('../assets/coronavirus.svg') as string;

const flower1 = require("../assets/flower1.svg") as string;
const flower2 = require("../assets/flower2.svg") as string;
const flower3 = require("../assets/flower3.svg") as string;

export enum Eve {
    NewYear,
    Feb23,
    Mar8,
    Apr1,
    Feb17,
}

export default class Festival {
    private static nameIconsDictionary = [
        {
            rule: (name: string, item: IWorkItem) =>
                name.indexOf("Шершнёв") !== -1 &&
                (item.titleFull.toLowerCase().indexOf("нп") !== -1 ||
                    item.titleFull.toLowerCase().indexOf("сообщен") !== -1 ||
                    item.titleFull.toLowerCase().indexOf("фигурант") !== -1 ||
                    item.createdByFull.toLowerCase().indexOf("тагулова") !== -1),
            icon: <Icon name="fire extinguisher" />,
        },
        { rule: (name: string, item: IWorkItem) => name.indexOf("Селихова") !== -1, icon: <Icon name="paw" /> },
        { rule: (name: string, item: IWorkItem) => name.indexOf("Жданович") !== -1, icon: <Icon name="transgender" /> },
        {
            rule: (name: string, item: IWorkItem) => name.indexOf("Якубовская") !== -1,
            icon: <Icon name="bell" />,
        },
    ];

    /*<img style={{ width: 14, height: 14, marginRight: 3 }} src={flower3} alt="" />*/

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
            case Eve.Feb17:
                return month === 2 && day === 17;
            default:
                return false;
        }
    }

    public static getFestivalHeaderIcon() {
        if (this.isEveNow(Eve.NewYear)) return [santaHat];
        if (this.isEveNow(Eve.Feb23)) return [feb23];
        if (this.isEveNow(Eve.Mar8)) return [mar8];

        return [null];//[coronavirus, 23, 14];
    }

    public static getFestivalNameBanner(name: string, nameFull: string, mode: number) {
        if (this.isEveNow(Eve.Feb17) && mode === 0 && store.settings.tfsUser.includes("sharshneu")) {
            return <span title={nameFull}>Шершнёв А. Ю.</span>;
        }

        if (this.isEveNow(Eve.Mar8) && (name.includes("Грамович") || name.includes("Якубовская") || name.includes("Селихова"))) {
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

    public static getSpecialNameEffect(item: IWorkItem, mode: number) {
        const name = mode === 1 ? item.createdBy : item.assignedTo;
        const nameFull = mode === 1 ? item.createdByFull : item.assignedToFull;

        let festivalNameBanner = Festival.getFestivalNameBanner(name, nameFull, mode);
        if (festivalNameBanner) return festivalNameBanner;

        let addition = <></>;

        this.nameIconsDictionary.forEach(nameIconRule => {
            if (nameIconRule.rule(name, item)) addition = nameIconRule.icon;
        });

        return (
            <span title={nameFull}>
                {addition}
                {name}
            </span>
        );
    }
}
