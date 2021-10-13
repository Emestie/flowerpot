import { IListItem, ISettings, TLists } from "../../helpers/Settings";
import { Actions } from "../actions-enum";
import { store } from "../store";
import { createAction } from "./_common";

//TODO: ISettings keys
export function settingsSet(settings: ISettings) {
    return createAction(Actions.SettingsSet, settings);
}

export function settingsUpdate(settings: any) {
    return createAction(Actions.SettingsUpdate, settings);
}

export function settingsMigrationsDonePush(migration: string) {
    const migrationsDone = [...store.getState().settings.migrationsDone, migration];

    return createAction(Actions.SettingsMigrationsDonePush, { migrationsDone });
}

export function settingsListUpdate(listName: TLists, items: IListItem[]) {
    const lists = store.getState().settings.lists;

    lists[listName] = items;

    return createAction(Actions.SettingsListUpdate, { lists: { ...lists } });
}
