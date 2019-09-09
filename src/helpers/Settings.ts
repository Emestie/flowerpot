import store from "../store";
import { IQuery } from "./Query";
import Electron from "./Electron";

export interface ISettings {
    tfsPath: string;
    tfsUser: string;
    tfsPwd: string;
    credentialsChecked: boolean;
    refreshRate: number;
    showNotifications: boolean;
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
    }

    public static pushToWindow() {
        //(window as any).flowerpotSettingsStorage = store.copy(store.settings);
        //localStorage.setItem("flowerpot", JSON.stringify(store.settings));
        Electron.setStoreProp("flowerpot", JSON.stringify(store.settings));
    }
}
