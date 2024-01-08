import moment from "moment";
import { appCurrentFestivalSet } from "../redux/actions/appActions";
import { store } from "../redux/store";
import { DynamicContent } from "./DynamicContent";

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

        const currentFestival = festivals.find((f) => moment().isBetween(f.dateFrom, f.dateTo, "minutes", "[]"));

        store.dispatch(appCurrentFestivalSet(currentFestival));
    }
}
