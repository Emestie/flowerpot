import preval from "preval.macro";
import store from "../store";

export default class Electron {
    public static updateTrayIcon(level: number) {
        if (!level || !+level || level > 4 || level < 1) level = 4;
        if ((window as any).ipcRenderer) (window as any).ipcRenderer.send("update-icon", level);
    }

    public static getVer() {
        const appVer = process.env.REACT_APP_VERSION;
        const dateTimeStamp = preval`module.exports = new Date().toISOString();`;
        return `${appVer} (${dateTimeStamp})`;
    }

    public static openUrl(url: string) {
        if ((window as any).shell && (window as any).shell.openExternal) (window as any).shell.openExternal(url);
    }

    public static isDev() {
        if ((window as any).isDev) return true;
        else return false;
    }

    public static getIpcRenderer() {
        if ((window as any).ipcRenderer) return (window as any).ipcRenderer;
        else return null;
    }

    public static updateApp() {
        if ((window as any).ipcRenderer) (window as any).ipcRenderer.send("update-app");
    }

    public static checkForUpdates() {
        let ipcRenderer = Electron.getIpcRenderer();
        if (ipcRenderer) {
            ipcRenderer.on("update_available", () => {
                ipcRenderer.removeAllListeners("update_available");
                store.updateReady = true;
            });
            ipcRenderer.send("check-for-updates");
        }
    }
}
