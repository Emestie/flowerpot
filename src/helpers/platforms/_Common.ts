import { TLocale } from "../../redux/types";
import Platform, { INotificationData } from "../Platform";

export default class CommonPlatform {
    public getStoreProp(prop: string) {
        let store = Platform.current.getSettingsStorage();
        if (store) return store.get(prop);
    }

    public setStoreProp(prop: string, value: any) {
        let store = Platform.current.getSettingsStorage();
        if (store) store.set(prop, value, true);
        Platform.current.sendIpcRenderer("save-settings-prop", { prop, value });
    }

    public copyString(s: string) {
        if ((window as any).electronClipboard)
            (window as any).electronClipboard.writeText(s);
    }

    public changeLocale(locale: TLocale) {
        //const { locale } = store.getState().app;
        Platform.current.setStoreProp("locale", locale);
    }

    public toggleAutostart(autostart: boolean) {
        //const { autostart } = store.getState().app;
        Platform.current.setStoreProp("autostart", autostart);
        Platform.current.sendIpcRenderer("toggle-autostart");
    }

    public updateTrayIcon(level: number, hasChanges?: boolean) {
        if (!level || !+level || level > 4 || level < 1) level = 4;
        Platform.current.sendIpcRenderer("update-icon", {
            level: level,
            hasChanges: !!hasChanges,
        });
    }

    public updateTrayIconDot(hasChanges: boolean) {
        Platform.current.sendIpcRenderer("update-icon-dot-only", !!hasChanges);
    }

    public isDev() {
        //?
        if ((window as any).isDev) return true;
        else return false;
    }

    public toggleConsole() {
        if ((window as any).electronRemote)
            (window as any).electronRemote.getCurrentWindow().toggleDevTools();
    }

    public getIpcRenderer() {
        if ((window as any).ipcRenderer) return (window as any).ipcRenderer;
        else return null;
    }

    public sendIpcRenderer(channel: string, data?: any) {
        let ipc = this.getIpcRenderer();
        if (ipc) ipc.send(channel, data);
    }

    public updateApp() {
        this.sendIpcRenderer("update-app");
    }

    public showNativeNotif(data: INotificationData) {
        this.sendIpcRenderer("show-notification", data);
    }

    public reactIsReady() {
        this.sendIpcRenderer("react-is-ready");
    }
}
