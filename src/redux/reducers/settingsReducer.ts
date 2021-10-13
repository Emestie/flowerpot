import Settings, { ISettings } from "../../helpers/Settings";
import { IAction, Reducers } from "../types";
import { updateState } from "./_common";

export interface ISettingsState extends ISettings {}

const initialState: ISettingsState = {
    tfsPath: "http://tfs:8080/tfs/",
    tfsUser: "",
    tfsPwd: "",
    credentialsChecked: false,
    refreshRate: 180,
    sortPattern: "default",
    notificationsMode: "all",
    iconChangesOnMyWorkItemsOnly: false,
    mineOnTop: true,
    queries: [],
    lists: {
        permawatch: [],
        favorites: [],
        deferred: [],
        hidden: [],
        keywords: [],
        pinned: [],
    },
    notes: [],
    links: [],
    darkTheme: false,
    allowTelemetry: true,
    showWhatsNewOnUpdate: true,
    showUnreads: true,
    showAvatars: true,
    showQuickLinks: true,
    lastTimeVersion: "",
    lastTimeVersionLong: "",
    migrationsDone: [],
    bannersShown: [],
};

export function settingsReducer(state = initialState, action: IAction) {
    const updatedState = updateState(Reducers.Settings, state, action);

    if (action.type.startsWith(Reducers.Settings + "/")) {
        Settings.save(updatedState);
    }

    return updatedState;
}
