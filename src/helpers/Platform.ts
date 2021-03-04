import ElectronPlatform from "./platforms/Electron";
import WebPlatform from "./platforms/Web";

export interface INotificationData {
    title: string;
    body?: string;
}

export interface IPlatformExtension {
    isLocal: () => boolean;
    getStoreProp: (prop: string) => any;
    setStoreProp: (prop: string, value: any) => void;
    copyString: (s: string) => void;
    changeLocale: () => void;
    toggleAutostart: () => void;
    updateTrayIcon: (level: number, hasChanges?: boolean) => void;
    updateTrayIconDot: (hasChanges: boolean) => void;
    openUrl: (url: string) => void;
    isDev: () => boolean;
    toggleConsole: () => void;
    getIpcRenderer: () => any;
    sendIpcRenderer: (channel: string, data?: any) => void;
    updateApp: () => void;
    showNativeNotif: (data: INotificationData) => void;
    checkForUpdates: (cyclic?: boolean) => void;
    reactIsReady: () => void;
    getSettingsStorage: () => any;
}

export enum PlatformType {
    Electron,
    Web,
}

export default class Platform {
    private static _current: IPlatformExtension;
    private static _type: PlatformType;

    public static get type() {
        if (!this._type) {
            if ((window as any).ipcRenderer) {
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
                throw new Error("Unknown Platform.current.");
        }
    }

    public static get current() {
        if (!this._current) {
            this.resolve();
        }
        return this._current;
    }
}
