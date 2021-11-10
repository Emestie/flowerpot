import { Eve } from "../../helpers/Festival";
import { Actions } from "../actions-enum";
import { IAppState } from "../reducers/appReducer";
import { store } from "../store";
import { IAction, TDialog, TUpdateStatus, TView } from "../types";
import { createAction } from "./_common";

export function appViewSet(view: TView): IAction {
    return createAction(Actions.AppViewSet, { view });
}

export function appErrorSet(message: string): IAction {
    return createAction(Actions.AppErrorSet, { view: "error", errorMessage: message });
}

export function appShowWhatsNewSet(showWhatsNew: boolean): IAction {
    return createAction(Actions.AppShowWhatsNewSet, { showWhatsNew });
}

//locale, autostart
export function appSet(fields: Partial<IAppState>): IAction {
    return createAction(Actions.AppSettingsSet, { ...fields });
}

export function appCurrentFestivalSet(currentFestival: Eve): IAction {
    return createAction(Actions.AppCurrentFestivalSet, { currentFestival });
}

export function appUpdateStatusSet(updateStatus: TUpdateStatus): IAction {
    return createAction(Actions.AppUpdateStatusSet, { updateStatus });
}

export function appDialogSet(dialogKey: TDialog, value: boolean) {
    const dialogs = store.getState().app.dialogs;

    dialogs[dialogKey] = value;

    return createAction(Actions.AppDialogSet, { dialogs });
}
