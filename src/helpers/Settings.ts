import store from "../store";
import { IQuery } from "./Query";

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
        let settings = localStorage.getItem("flowerpot");
        if (settings) {
            try {
                let parsedSettings = JSON.parse(settings);
                store.setSettings(parsedSettings);
            } catch (e) {}
        }
    }

    public static pushToWindow() {
        //(window as any).flowerpotSettingsStorage = store.copy(store.settings);
        localStorage.setItem("flowerpot", JSON.stringify(store.settings));
    }
}
