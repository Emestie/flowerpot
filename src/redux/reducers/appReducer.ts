import { IFestivalDescriptor } from "../../helpers/Festival";
import { IAction, Reducers, TLocale, TUpdateStatus, TView } from "../types";
import { updateState } from "./_common";

export interface IAppState<IVP = Record<string, any>> {
    view: TView;
    viewParams: IVP;
    updateStatus: TUpdateStatus;
    dialogs: { [key: string]: boolean };
    currentFestival: IFestivalDescriptor | undefined;
    showWhatsNew: boolean;
    autostart: boolean;
    locale: TLocale;
    showMineOnly: boolean;
}

const initialState: IAppState = {
    view: "loading",
    viewParams: {},
    updateStatus: "none",
    dialogs: {},
    currentFestival: undefined,
    showWhatsNew: false,
    autostart: true,
    locale: "en",
    showMineOnly: false,
};

export function appReducer(state = initialState, action: IAction) {
    return updateState(Reducers.App, state, action);
}
