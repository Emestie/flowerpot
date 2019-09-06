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
        let settings = (window as any).flowerpotSettingsStorage;
        if (settings) store.setSettings(settings);
    }

    public static pushToWindow() {
        (window as any).flowerpotSettingsStorage = JSON.parse(JSON.stringify(store.settings));
    }

    // public static get(name: string) {
    //     let storage = (window as any).flowerpotSettingsStorage;
    //     if (!storage) return undefined;
    //     return storage[name];
    // }

    // public static set(name: string, value: any) {
    //     let storage = (window as any).flowerpotSettingsStorage;
    //     if (!storage) (window as any).flowerpotSettingsStorage = {};
    //     (window as any).flowerpotSettingsStorage[name] = value;
    // }
}
