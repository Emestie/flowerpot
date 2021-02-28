import ElectronPlatform from "./platforms/Electron";

export interface INotificationData {
    title: string;
    body?: string;
}

export interface IPlatformExtension {
    isLocal: () => boolean;
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
            this._type = PlatformType.Electron;
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
