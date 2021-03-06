import store from "../../store";
import { INotificationData, IPlatformExtension } from "../Platform";
import CommonPlatform from "./_Common";

export default class ElectronPlatform extends CommonPlatform implements IPlatformExtension {
    public isLocal() {
        return document.location.href.indexOf("build") !== -1;
    }
    
    public getSettingsStorage() {
        if ((window as any).electronStore) return (window as any).electronStore;
        else return null;
    }

    public openUrl(url: string) {
        if ((window as any).shell && (window as any).shell.openExternal) (window as any).shell.openExternal(url);
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
}
