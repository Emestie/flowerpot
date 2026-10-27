import { TLocale } from "../types";
import ElectronPlatform from "./platforms/Electron";
import WebPlatform from "./platforms/Web";

export interface INotificationData {
    title: string;
    body?: string;
}

/** What happened when the settings file was read at startup. */
export interface ISettingsStoreStatus {
    /** false when the file was there but could not be read */
    ok: boolean;
    /** true when nothing may be written, so a damaged file is kept intact */
    readOnly: boolean;
    /** "backup" / "temp" when settings were restored from a sibling copy */
    recoveredFrom: "backup" | "temp" | null;
    /** where the damaged file was kept, if it was kept */
    corruptBackupPath: string | null;
}

export interface IPlatformClass {
    isLocal: () => boolean;
    getStoreProp: <T = unknown>(prop: string) => Promise<T>;
    setStoreProp: (prop: string, value: any) => void;
    getSettingsStatus: () => Promise<ISettingsStoreStatus>;
    /** Reveals the settings file, or the copy kept from a damaged one, in the file manager. */
    showSettingsFile: (target: "settings" | "backup") => void;
    copyString: (s: string) => void;
    changeLocale: (locale: TLocale) => void;
    toggleAutostart: (autostart: boolean) => void;
    updateTrayIcon: (level: number, hasChanges?: boolean) => void;
    updateTrayIconDot: (hasChanges: boolean) => void;
    openUrl: (url: string) => void;
    isDev: () => boolean;
    toggleConsole: () => void;
    updateApp: () => void;
    showNotification: (data: INotificationData) => void;
    checkForUpdates: (cyclic?: boolean) => void;
    reactIsReady: () => void;
    get os(): OS;
    initUpdateListeners: () => (() => void) | void;
}

export enum PlatformType {
    Electron,
    Web,
}

export type OS = "win32" | "darwin" | "web" | "linux" | "android" | "ios";

export default class Platform {
    private static _current: IPlatformClass;
    private static _type: PlatformType;

    public static get type() {
        if (!this._type) {
            if (window.eapi) {
                this._type = PlatformType.Electron;
            } else {
                this._type = PlatformType.Web;
            }
        }
        return this._type;
    }

    private static resolve() {
        const type = this.type;
        switch (type) {
            case PlatformType.Electron:
                this._current = new ElectronPlatform();
                break;
            case PlatformType.Web:
                this._current = new WebPlatform();
                break;
            default:
                throw new Error("Unknown platform type: " + this.type);
        }
    }

    public static get current() {
        if (!this._current) {
            this.resolve();
        }
        return this._current;
    }
}
