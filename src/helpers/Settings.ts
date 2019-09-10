import store from "../store";
import { IQuery } from "./Query";
import Electron from "./Electron";

export type TSortPattern = "default" | "assignedto" | "id";
export type TNotificationsMode = "all" | "mine" | "none";

export interface ISettings {
    tfsPath: string;
    tfsUser: string;
    tfsPwd: string;
    credentialsChecked: boolean;
    refreshRate: number;
    sortPattern: TSortPattern;
    notificationsMode: TNotificationsMode;
    iconChangesOnMyWorkItemsOnly: boolean;
    queries: IQuery[];
}

export default class Settings {
    public static pullFromWindow() {
        //let settings = (window as any).flowerpotSettingsStorage;
        //let settings = localStorage.getItem("flowerpot");
        let settings = Electron.getStoreProp("flowerpot") || localStorage.getItem("flowerpot");
        if (settings) {
            try {
                let parsedSettings = JSON.parse(settings);
                store.setSettings(parsedSettings);
            } catch (e) {}
        }

        store.autostart = Electron.getStoreProp("autostart");
    }

    public static pushToWindow() {
        //(window as any).flowerpotSettingsStorage = store.copy(store.settings);
        //localStorage.setItem("flowerpot", JSON.stringify(store.settings));
        try {
            let settingsToStore = JSON.stringify(store.settings);
            Electron.setStoreProp("flowerpot", settingsToStore);
        } catch (e) {}
    }
}
