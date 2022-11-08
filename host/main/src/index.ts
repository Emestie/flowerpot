import { app } from "electron";
import "./security-restrictions";
import "./ipc-handlers";
import { getAppWindow, restoreOrCreateWindow } from "./main-window";
import { autoUpdater } from "electron-updater";
import { store } from "./store";
import { showNotification } from "./functions";

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
    app.quit();
    process.exit(0);
}
app.on("second-instance", restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on("window-all-closed", () => {
    // if (process.platform !== "darwin") {
    //     app.quit();
    // }
    if (process.platform === "darwin") app.quit();
});

app.on("before-quit", () => ((app as any).quitting = true));

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on("activate", restoreOrCreateWindow);

/**
 * Create the application window when the background process is ready.
 */
app.whenReady()
    .then(restoreOrCreateWindow)
    .catch((e) => console.error("Failed create window:", e));

/**
 * Install Vue.js or some other devtools - development mode only.
 */
// if (import.meta.env.DEV) {
//     app.whenReady()
//         .then(() => import("electron-devtools-installer"))
//         .then(({ default: installExtension, VUEJS3_DEVTOOLS }) =>
//             installExtension(VUEJS3_DEVTOOLS, {
//                 loadExtensionOptions: {
//                     allowFileAccess: true,
//                 },
//             })
//         )
//         .catch((e) => console.error("Failed install extension:", e));
// }

/**
 * Check for new version of the application - production mode only.
 */
if (import.meta.env.PROD) {
    app.whenReady()
        .then(() => autoUpdater.checkForUpdatesAndNotify())
        .catch((e) => console.error("Failed check updates:", e));
}

autoUpdater.on("checking-for-update", () => {
    getAppWindow()?.webContents.send("checking_for_update");
});

autoUpdater.on("update-not-available", () => {
    getAppWindow()?.webContents.send("update_not_available");
});

autoUpdater.on("download-progress", (data) => {
    getAppWindow()?.webContents.send("download_progress", data);
});

autoUpdater.on("update-available", () => {
    getAppWindow()?.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
    getAppWindow()?.webContents.send("update_downloaded");

    const en = { title: "Update Arrived!", body: "Flowerpot is ready to install an update" };
    const ru = { title: "Доступно обновление!", body: "Flowerpot готов обновиться" };

    let locale = store.get("locale");
    if (locale === "auto") {
        locale = "en";
    }

    showNotification(4, locale === ru ? ru : en);
});

autoUpdater.on("error", () => {
    getAppWindow()?.webContents.send("update_error");
});
