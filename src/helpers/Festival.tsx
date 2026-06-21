import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useAppStore } from "../zustand/app";
import { DynamicContent } from "./DynamicContent";

dayjs.extend(isBetween);

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

export default class Festival {
    public static async findOut() {
        const festivals = await DynamicContent.loadFestivalJson();

        const currentFestival = festivals.find((f) => dayjs().isBetween(f.dateFrom, f.dateTo, "minute", "[]"));

        useAppStore.getState().setCurrentFestival(currentFestival);
    }
}
