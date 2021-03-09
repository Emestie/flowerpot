import React from "react";
import store from "../store";
import { IWorkItem } from "./WorkItem";
import { Icon, Image, Label } from "semantic-ui-react";

const christmasTree = require("../assets/christmas-tree.svg") as string;
const feb23 = require("../assets/feb23.svg") as string;
const mar8 = require("../assets/mar8.svg") as string;
const coronavirus = require("../assets/coronavirus.svg") as string;
const longLiveBelarus = require("../assets/wrw-128.png") as string;
const sep3 = require("../assets/sept3.svg") as string;
const sep14 = require("../assets/mug.svg") as string;
const haloween = require("../assets/halloween-bats.svg") as string;

const flower1 = require("../assets/flower1.svg") as string;
const flower2 = require("../assets/flower2.svg") as string;
const flower3 = require("../assets/flower3.svg") as string;

export enum Eve {
    NewYear,
    Feb23,
    Mar8,
    Apr1,
    Feb17,
    Sept3,
    Sept14,
    Haloween,
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
        // {
        //     rule: (name: string, item: IWorkItem) => name.indexOf("Якубовская") !== -1,
        //     icon: <Icon name="bell" />,
        // },
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
                return month === 3 && day <= 8 && day >= 4;
            case Eve.Feb17:
                return month === 2 && day === 17;
            case Eve.Sept3:
                return month === 9 && day === 3;
            case Eve.Sept14:
                return month === 9 && day === 14;
            case Eve.Haloween:
                return (month === 11 && day <= 2) || (month === 10 && day >= 30);
            default:
                return false;
        }
    }

    public static getFestivalHeaderIcon() {
        if (this.isEveNow(Eve.NewYear)) return [christmasTree, 12, 14, 32, 32];
        if (this.isEveNow(Eve.Feb23)) return [feb23];
        if (this.isEveNow(Eve.Mar8)) return [mar8, 12, 14, 32, 32];
        if (this.isEveNow(Eve.Sept3)) return [sep3, 12, 14, 32, 32];
        if (this.isEveNow(Eve.Sept14)) return [sep14, 10, 14, 32, 32];
        if (this.isEveNow(Eve.Haloween)) return [haloween, undefined, undefined, 40, 40];

        return [longLiveBelarus, undefined, 13, 40, 46];
        //return [coronavirus, 23, 14];

        //[icon, top, left, w, h, offset];
    }

    public static getFestivalNameBanner(name: string, nameFull: string, mode: number) {
        if (this.isEveNow(Eve.Feb17) && mode === 0 && store.settings.tfsUser.includes("sharshneu")) {
            return <span title={nameFull}>Шершнёв А. Ю.</span>;
        }

        if (this.isEveNow(Eve.Mar8) && (name.includes("Меницкая") || name.includes("Якубовская") || name.includes("Селихова"))) {
            let src = name.includes("Меницкая") ? flower1 : name.includes("Якубовская") ? flower3 : flower2;

            let addition = <img style={{ width: 26, height: 26, marginRight: 5 }} src={src} alt="" />;

            return (
                <span className={"ui avatar right spaced image av-class"} title={nameFull}>
                    <div className={"ui basic image label user-label"}>
                        {addition}
                        <span className={"mar8NameLabel"}>{name}</span>
                    </div>
                </span>
            );
        }

        return null;
    }

    private static getSaltValue() {
        return Math.floor(Math.random() * 10000).toString();
    }

    public static getSpecialNameEffect(item: IWorkItem, mode: number) {
        const name = mode === 1 ? item.createdBy : item.assignedTo;
        const nameFull = mode === 1 ? item.createdByFull : item.assignedToFull;
        const nameImg = mode === 1 ? item.createdByImg : item.assignedToImg; // + "?salt=" + this.getSaltValue();
        const showAvatars = store.settings.showAvatars;

        let festivalNameBanner = Festival.getFestivalNameBanner(name, nameFull, mode);
        if (festivalNameBanner) return festivalNameBanner;

        let addition = <></>;

        this.nameIconsDictionary.forEach((nameIconRule) => {
            if (nameIconRule.rule(name, item)) addition = <span style={{ marginLeft: 3 }}> {nameIconRule.icon}</span>;
        });

        return (
            <span title={nameFull}>
                <Label basic image className="user-label">
                    {showAvatars && nameImg && <Image className="av-class" avatar spaced="right" src={nameImg} />}
                    {name}
                    {addition}
                </Label>
            </span>
        );
    }
}
