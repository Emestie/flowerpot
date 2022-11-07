import { Eve } from "../../helpers/Festival";
import { Actions } from "../actions-enum";
import { IAppState } from "../reducers/appReducer";
import { store } from "../store";
import { IAction, TDialog, TUpdateStatus, TView } from "../types";
import { createAction } from "./_common";

//TODO: debug purposes. Move somewhere
(window as any)._setView = (view: TView) => store.dispatch(appViewSet(view));

export function appViewSet(view: TView, viewParams: Record<string, any> = {}): IAction {
    return createAction(Actions.AppViewSet, { view, viewParams });
}

export function appErrorSet(message: string): IAction {
    return createAction(Actions.AppErrorSet, { view: "error", viewParams: { errorMessage: message } });
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

export function appShowMineOnlySet(showMineOnly: boolean): IAction {
    return createAction(Actions.AppShowMineOnlySet, { showMineOnly });
}
