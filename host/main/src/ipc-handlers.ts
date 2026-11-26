import { app, clipboard, ipcMain, shell } from "electron";
import { autoUpdater } from "electron-updater";
import { clearCompatMode, getCompatModeStatus } from "./compat-mode";
import { iconUpdateTask, registerAutostart, showNotification, tray } from "./functions";
import { getLogFilePath, log } from "./logger";
import { getAppWindow } from "./main-window";
import { store } from "./store";

let currentLevel = 0;

const userDataPath = app.getPath("userData");
const isDev = import.meta.env.DEV;

ipcMain.handle("user-data-path", () => userDataPath);
ipcMain.handle("read-settings-prop", (_, prop) => store.get(prop));
ipcMain.handle("read-settings-status", () => store.getStatus());
ipcMain.handle("read-compat-mode", () => getCompatModeStatus());
ipcMain.handle("read-is-dev", (_) => isDev);

/** Leaves compatibility mode and restarts with the Chromium sandbox enabled. */
ipcMain.on("disable-compat-mode", () => {
    log("Compatibility mode disabled by the user; restarting with the Chromium sandbox");
    clearCompatMode();
    store.flushSync();

    // The running process was started with `--no-sandbox`, so it must be dropped
    // from the relaunch arguments or the retry would not actually test the sandbox.
    const args = process.argv.slice(1).filter((arg) => arg !== "--no-sandbox");
    app.relaunch({ args });
    app.exit(0);
});

ipcMain.on("show-main-log", () => {
    shell.showItemInFolder(getLogFilePath());
});

ipcMain.on("update-icon", (_, { level, hasChanges }) => {
    if (!tray || level < 0 || level > 4) return;
    currentLevel = level;
    iconUpdateTask(level, hasChanges);
});

ipcMain.on("update-icon-dot-only", (_, hasChanges) => {
    if (!tray) return;
    iconUpdateTask(currentLevel, hasChanges);
});

ipcMain.on("check-for-updates", () => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => console.error("Failed check updates:", err));
});

ipcMain.on("update-app", () => {
    // the app quits immediately below, so pending settings must hit the disk now
    store.flushSync();

    if (process.platform === "darwin") {
        if (getAppWindow() !== null) {
            (app as any).quitting = true;
            getAppWindow()?.close();
        }
        return;
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
    if (!tray) return;
    iconUpdateTask(currentLevel, false);
});

ipcMain.on("save-settings-prop", (_, data) => {
    store.set(data.prop, data.value);
});

/** Reveals the settings file (or the copy kept from a damaged one) in the OS file manager. */
ipcMain.on("show-settings-file", (_, target?: "settings" | "backup") => {
    const filePath = (target === "backup" && store.getCorruptFilePath()) || store.getFilePath();
    shell.showItemInFolder(filePath);
});

ipcMain.on("toggle-dev-tools", (_) => getAppWindow()?.webContents.openDevTools());

ipcMain.on("clipboard-write-text", (_, text) => clipboard.writeText(text));
ipcMain.handle("clipboard-read-text", () => clipboard.readText());
ipcMain.on("shell-open-external", (_, url) => shell.openExternal(url));
