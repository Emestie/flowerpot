import { app, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { tray, iconUpdateTask, showNotification, registerAutostart } from "./functions";
import { getAppWindow } from "./main-window";
import { store } from "./store";
let currentLevel = 0;
const userDataPath = app.getPath("userData");
const isDev = import.meta.env.DEV;
ipcMain.handle("user-data-path", () => userDataPath);
ipcMain.handle("read-settings-prop", (_, prop) => store.get(prop));
ipcMain.handle("read-is-dev", (_) => isDev);
ipcMain.on("update-icon", (_, { level, hasChanges }) => {
    if (!tray || level < 0 || level > 4)
        return;
    currentLevel = level;
    iconUpdateTask(level, hasChanges);
});
ipcMain.on("update-icon-dot-only", (_, hasChanges) => {
    iconUpdateTask(currentLevel, hasChanges);
});
ipcMain.on("check-for-updates", () => {
    autoUpdater.checkForUpdatesAndNotify();
});
ipcMain.on("update-app", () => {
    if (process.platform === "darwin" && getAppWindow() !== null) {
        app.quitting = true;
        getAppWindow()?.close();
    }
    autoUpdater.quitAndInstall();
    //setImmediate(() => {
    // app.removeAllListeners("window-all-closed");
    // const browserWindows = BrowserWindow.getAllWindows();
    // browserWindows.forEach((browserWindow) => {
    //     browserWindow.removeAllListeners("close");
    // });
    // if (wnd !== null) {
    //     wnd.close();
    // }
    // autoUpdater.quitAndInstall();
    //});
});
ipcMain.on("show-notification", (e, data) => {
    showNotification(currentLevel, data);
});
ipcMain.on("toggle-autostart", () => {
    registerAutostart();
});
ipcMain.on("react-is-ready", () => {
    iconUpdateTask(currentLevel, false);
});
ipcMain.on("save-settings-prop", (_, data) => {
    store.set(data.prop, data.value);
});
ipcMain.on("toggle-dev-tools", (_) => getAppWindow()?.webContents.openDevTools());
