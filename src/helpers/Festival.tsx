import { IWorkItem } from "./WorkItem";
import { Image, Label } from "semantic-ui-react";
import { store } from "../redux/store";
import { appCurrentFestivalSet } from "../redux/actions/appActions";
import { DynamicContent } from "./DynamicContent";
import moment from "moment";
import flower1 from "../assets/flower1.svg";
import flower2 from "../assets/flower2.svg";
import flower3 from "../assets/flower3.svg";

export interface IFestivalDescriptor {
    name: string;
    dateFrom: string;
    dateTo: string;
    icon: {
        path: string;
        top: number;
        left: number;
        width: number;
        height: number;
        offset: number;
    };
}
//[icon, top, left, w, h, offset]

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

    public static async findOut() {
        const festivals = await DynamicContent.loadFestivalJson();

        const currentFestival = festivals.find((f) => moment().isBetween(f.dateFrom, f.dateTo, "minutes", "[]"));

        store.dispatch(appCurrentFestivalSet(currentFestival));
    }

    public static getFestivalNameBanner(name: string, nameFull: string) {
        const { currentFestival } = store.getState().app;

        if (
            currentFestival?.name === "mar8" &&
            (name.includes("Меницкая") || name.includes("Якубовская") || name.includes("Селихова"))
        ) {
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

    public static getSpecialNameEffect(
        displayName: string,
        nameFullWithUID: string,
        avatar: string,
        workItem?: IWorkItem
    ) {
        const { showAvatars } = store.getState().settings;

        let festivalNameBanner = Festival.getFestivalNameBanner(displayName, nameFullWithUID);
        if (festivalNameBanner) return festivalNameBanner;

        let addition = <></>;

        this.nameIconsDictionary.forEach((nameIconRule) => {
            if (workItem && nameIconRule.rule(displayName, workItem))
                addition = <span style={{ marginLeft: 3 }}> {nameIconRule.icon}</span>;
        });

        return (
            <span title={nameFullWithUID}>
                <Label basic image className="user-label">
                    {showAvatars && avatar && <Image className="av-class" avatar spaced="right" src={avatar} />}
                    {displayName}
                    {addition}
                </Label>
            </span>
        );
    }
}
