import { Eve } from "../../helpers/Festival";
import { IAction, Reducers, TLocale, TUpdateStatus, TView } from "../types";
import { updateState } from "./_common";

export interface IAppState {
    view: TView;
    errorMessage: string;
    updateStatus: TUpdateStatus;
    dialogs: { [key: string]: boolean };
    loadingInProgressList: string[];
    isFestivalOn: boolean;
    currentFestival: Eve;
    festivalHeaderOffset: number;
    showWhatsNew: boolean;
    autostart: boolean;
    locale: TLocale;
}

const initialState: IAppState = {
    view: "loading",
    errorMessage: "",
    updateStatus: "none",
    dialogs: {},
    loadingInProgressList: [],
    isFestivalOn: false,
    currentFestival: Eve._none,
    festivalHeaderOffset: 0,
    showWhatsNew: false,
    autostart: true,
    locale: "en",
};

export function appReducer(state = initialState, action: IAction) {
    return updateState(Reducers.App, state, action);
}
