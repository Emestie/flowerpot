import preval from "preval.macro";

export default class Electron {
    public static updateTrayIcon(level: number) {
        if (!level || !+level || level > 4 || level < 1) level = 4;
        if ((window as any).ipcRenderer) (window as any).ipcRenderer.send("update-icon", level);
    }

    public static getVer() {
        const appVer = process.env.REACT_APP_VERSION;
        const dateTimeStamp = preval`module.exports = new Date().toLocaleString();`;
        return `${appVer} (${dateTimeStamp})`;
    }

    public static openUrl(url: string) {
        if ((window as any).shell && (window as any).shell.openExternal) (window as any).shell.openExternal(url);
    }
}
