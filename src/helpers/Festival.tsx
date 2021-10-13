import React from "react";
import { IWorkItem } from "./WorkItem";
import { Image, Label } from "semantic-ui-react";
import { s } from "../values/Strings";
import { store } from "../redux/store";
import { appCurrentFestivalSet } from "../redux/actions/appActions";

const christmasTree = require("../assets/christmas-tree.svg").default as string;
const feb23 = require("../assets/feb23.svg").default as string;
const mar8 = require("../assets/mar8.svg").default as string;
//const coronavirus = require("../assets/coronavirus.svg").default as string;
//const longLiveBelarus = require("../assets/wrw-128.png").default as string;
const sep3 = require("../assets/sept3.svg").default as string;
const sep14 = require("../assets/mug.svg").default as string;
const haloween = require("../assets/halloween-bats.svg").default as string;
const tenYearsAnniversaryA = require("../assets/10years-a.svg").default as string;

const flower1 = require("../assets/flower1.svg").default as string;
const flower2 = require("../assets/flower2.svg").default as string;
const flower3 = require("../assets/flower3.svg").default as string;

export enum Eve {
    _none,
    NewYear,
    Feb23,
    Mar8,
    Apr1,
    Sept3,
    Sept14,
    Haloween,
    TenYearsAnniversary,
}

interface IIconRule {
    rule: (name: string, item: IWorkItem) => boolean;
    icon: JSX.Element;
}

export default class Festival {
    private static nameIconsDictionary: IIconRule[] = [
        // {
        //     rule: (name: string, item: IWorkItem) =>
        //         name.indexOf("Шершнёв") !== -1 &&
        //         (item.titleFull.toLowerCase().indexOf("нп") !== -1 ||
        //             item.titleFull.toLowerCase().indexOf("сообщен") !== -1 ||
        //             item.titleFull.toLowerCase().indexOf("фигурант") !== -1 ||
        //             item.createdByFull.toLowerCase().indexOf("тагулова") !== -1),
        //     icon: <Icon name="fire extinguisher" />,
        // },
        // { rule: (name: string, item: IWorkItem) => name.indexOf("Селихова") !== -1, icon: <Icon name="paw" /> },
        // { rule: (name: string, item: IWorkItem) => name.indexOf("Жданович") !== -1, icon: <Icon name="transgender" /> },
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
        const year = now.getFullYear();

        return [day, month, year];
    }

    public static findOut() {
        const findFestival = () => {
            const [day, month, year] = this.getHumanDate();

            if ((month === 1 && day <= 8) || (month === 12 && day >= 20)) {
                return Eve.NewYear;
            }
            if ((month === 2 && day >= 21) || (month === 2 && day <= 23)) {
                return Eve.Feb23;
            }
            if (month === 3 && day <= 8 && day >= 4) {
                return Eve.Mar8;
            }
            if (month === 9 && day === 3) {
                return Eve.Sept3;
            }
            // if (month === 9 && day === 14) {return  Eve.Sept14;}
            if ((month === 11 && day <= 2) || (month === 10 && day >= 28)) {
                return Eve.Haloween;
            }
            if (year === 2021 && (month === 7 || (month === 8 && day < 15))) {
                return Eve.TenYearsAnniversary;
            }

            return Eve._none;
        };

        const currentFestival = findFestival();

        //store.currentFestival = currentFestival;
        store.dispatch(appCurrentFestivalSet(currentFestival));
    }

    private static isEveNow(eve: Eve) {
        const { currentFestival } = store.getState().app;
        return currentFestival === eve;
        // const [day, month, year] = this.getHumanDate();

        // switch (eve) {
        //     case Eve.NewYear:
        //         return (month === 1 && day <= 8) || (month === 12 && day >= 20);
        //     case Eve.Feb23:
        //         return month === 2 && day === 21;
        //     case Eve.Mar8:
        //         return month === 3 && day <= 8 && day >= 4;
        //     case Eve.Sept3:
        //         return month === 9 && day === 3;
        //     case Eve.Sept14:
        //         return month === 9 && day === 14;
        //     case Eve.Haloween:
        //         return (month === 11 && day <= 2) || (month === 10 && day >= 30);
        //     case Eve.TenYearsAnniversary:
        //         return year === 2021 && (month === 7 || (month === 8 && day < 15));
        //     default:
        //         return false;
        // }
    }

    public static getFestivalHeaderIcon(): any {
        //please return [] as default case

        // const currentFestival = store.currentFestival;
        const { currentFestival } = store.getState().app;

        switch (currentFestival) {
            case Eve.NewYear:
                return [christmasTree, 12, 14, 32, 32];
            case Eve.Feb23:
                return [feb23];
            case Eve.Mar8:
                return [mar8, 12, 14, 32, 32];
            case Eve.Sept3:
                return [sep3, 12, 14, 32, 32];
            case Eve.Sept14:
                return [sep14, 10, 14, 32, 32];
            case Eve.Haloween:
                return [haloween, undefined, undefined, 40, 40];
            case Eve.TenYearsAnniversary:
                return [tenYearsAnniversaryA, 12, 14, 36, 36, 50, s("TenYearsAnny")];
            default:
                return [];
            //return [longLiveBelarus, undefined, 13, 40, 46];
            //return [coronavirus, 23, 14];

            //[icon, top, left, w, h, offset];
        }

        // if (this.isEveNow(Eve.NewYear)) return [christmasTree, 12, 14, 32, 32];
        // if (this.isEveNow(Eve.Feb23)) return [feb23];
        // if (this.isEveNow(Eve.Mar8)) return [mar8, 12, 14, 32, 32];
        // if (this.isEveNow(Eve.Sept3)) return [sep3, 12, 14, 32, 32];
        // if (this.isEveNow(Eve.Sept14)) return [sep14, 10, 14, 32, 32];
        // if (this.isEveNow(Eve.Haloween)) return [haloween, undefined, undefined, 40, 40];
        // if (this.isEveNow(Eve.TenYearsAnniversary)) return [tenYearsAnniversaryA, 12, 14, 36, 36, 50, s("TenYearsAnny")];

        // return [];
        //return [longLiveBelarus, undefined, 13, 40, 46];
        //return [coronavirus, 23, 14];

        //[icon, top, left, w, h, offset];
    }

    public static getFestivalNameBanner(name: string, nameFull: string, mode: number) {
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
        const { showAvatars } = store.getState().settings;
        //const showAvatars = store.settings.showAvatars;

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
