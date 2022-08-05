import { Eve } from "../../helpers/Festival";
import { IAction, Reducers, TLocale, TUpdateStatus, TView } from "../types";
import { updateState } from "./_common";

export enum Sections {
    Account,
    Queries,
    WorkItems,
    Projects,
    QuickLinks,
    Stats,
    Credits,
}

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
    settingsSection: Sections;
    showMineOnly: boolean;
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
    settingsSection: Sections.Queries,
    showMineOnly: false,
};

export function appReducer(state = initialState, action: IAction) {
    return updateState(Reducers.App, state, action);
}
