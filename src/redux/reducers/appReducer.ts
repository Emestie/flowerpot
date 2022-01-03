import { Eve } from "../../helpers/Festival";
import { IAction, Reducers, TLocale, TUpdateStatus, TView } from "../types";
import { updateState } from "./_common";

export interface IAppState<IVP = Record<string, any>> {
    view: TView;
    viewParams: IVP;
    updateStatus: TUpdateStatus;
    dialogs: { [key: string]: boolean };
    isFestivalOn: boolean;
    currentFestival: Eve;
    festivalHeaderOffset: number;
    showWhatsNew: boolean;
    autostart: boolean;
    locale: TLocale;
}

const initialState: IAppState = {
    view: "loading",
    viewParams: {},
    updateStatus: "none",
    dialogs: {},
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
