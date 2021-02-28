import store from "../../store";
import { INotificationData, IPlatformExtension } from "../Platform";
import CommonPlatform from "./_Common";

export default class ElectronPlatform extends CommonPlatform implements IPlatformExtension {
    private getElectronStore() {
        if ((window as any).electronStore) return (window as any).electronStore;
        else return null;
    }

    public getStoreProp(prop: string) {
        let store = this.getElectronStore();
        if (store) return store.get(prop);
    }

    public setStoreProp(prop: string, value: any) {
        let store = this.getElectronStore();
        if (store) store.set(prop, value, true);
        this.sendIpcRenderer("save-settings-prop", { prop, value });
    }

    public copyString(s: string) {
        if ((window as any).electronClipboard) (window as any).electronClipboard.writeText(s);
    }

    public changeLocale() {
        this.setStoreProp("locale", store.locale);
    }

    public toggleAutostart() {
        this.setStoreProp("autostart", store.autostart);
        this.sendIpcRenderer("toggle-autostart");
    }

    public updateTrayIcon(level: number, hasChanges?: boolean) {
        if (!level || !+level || level > 4 || level < 1) level = 4;
        this.sendIpcRenderer("update-icon", { level: level, hasChanges: !!hasChanges });
    }

    public updateTrayIconDot(hasChanges: boolean) {
        this.sendIpcRenderer("update-icon-dot-only", !!hasChanges);
    }

    public openUrl(url: string) {
        if ((window as any).shell && (window as any).shell.openExternal) (window as any).shell.openExternal(url);
    }

    public isDev() {
        if ((window as any).isDev) return true;
        else return false;
    }

    public toggleConsole() {
        if ((window as any).electronRemote) (window as any).electronRemote.getCurrentWindow().toggleDevTools();
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

    public checkForUpdates(cyclic?: boolean) {
        if (cyclic) {
            setInterval(() => {
                this.checkForUpdates();
            }, 1000 * 60 * 60);

            setInterval(() => {
                if (store.updateStatus !== "ready" && store.updateStatus !== "downloading" && !this.isDev() && store.view === "main") {
                    const href = "https://flowerpot-pwa.web.app/firebase-entry-point.html?salt=x" + Math.floor(Math.random() * 100000000);
                    document.location.href = href;
                }
            }, 1000 * 60 * 61);
        }

        let ipcRenderer = this.getIpcRenderer();
        if (ipcRenderer) {
            ipcRenderer.on("checking_for_update", () => {
                ipcRenderer.removeAllListeners("checking_for_update");
                store.updateStatus = "checking";
            });
            ipcRenderer.on("update_not_available", () => {
                ipcRenderer.removeAllListeners("update_not_available");
                store.updateStatus = "none";
            });
            ipcRenderer.on("update_available", () => {
                ipcRenderer.removeAllListeners("update_available");
                store.updateStatus = "downloading";
            });
            ipcRenderer.on("update_downloaded", () => {
                ipcRenderer.removeAllListeners("update_downloaded");
                store.updateStatus = "ready";
            });
            ipcRenderer.on("update_error", () => {
                ipcRenderer.removeAllListeners("update_error");
                store.updateStatus = "error";
            });
            ipcRenderer.send("check-for-updates");
        }
    }

    public reactIsReady() {
        this.sendIpcRenderer("react-is-ready");
    }
}
