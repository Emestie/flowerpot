import { app, Menu, Notification, Tray } from "electron";
import * as fs from "fs";
import * as path from "path";
import { getAppWindow } from "./main-window";
import { store } from "./store";
const nativeImage = require("electron").nativeImage;

const isDev = import.meta.env.DEV;
export let tray: Tray;

const getResourcePath = () => "../../../build-resources/";

function warnIfMissing(iconPath: string) {
    try {
        if (!fs.existsSync(iconPath)) {
            console.error(`Missing tray icon resource: ${iconPath}`);
        }
    } catch (e) {
        console.error(`Failed to check tray icon resource ${iconPath}:`, e);
    }
}

export const showNotification = (level: any, data: any) => {
    if (isDev && process.platform === "win32") return; // Suppress dev notifications on Windows to prevent a rogue "Electron.lnk" Start Menu shortcut (see electron#4241).
    const wnd = getAppWindow();
    data.icon = buildIconPath(level, false, true);
    const notif = new Notification(data);
    notif.on("click", () => {
        wnd?.show();
    });
    notif.show();
};

export function buildIconPath(level: any, hasChanges?: boolean, hiRez?: any) {
    if (hasChanges) level = level + "d";

    const iconPath =
        process.platform === "win32"
            ? path.join(__dirname, getResourcePath(), "icons/ico/flower" + level + ".ico")
            : path.join(__dirname, getResourcePath(), "icons/png/flower" + level + getIconExt(hiRez));

    warnIfMissing(iconPath);

    return iconPath;
}

function buildIconDotPath(level: any, _: any) {
    return path.join(__dirname, getResourcePath(), "icons/dots/dot" + level + ".png");
}

function getIconExt(hiRez: any) {
    return process.platform === "darwin" && !hiRez ? "-16.png" : ".png";
}

export function iconUpdateTask(level: any, hasChanges: any) {
    let pathToIcon = buildIconPath(level, hasChanges);
    let pathToDotIcon = buildIconDotPath(level, hasChanges);

    try {
        let ni = nativeImage.createFromPath(pathToIcon);
        tray.setImage(ni);

        if (process.platform === "win32") {
            let nidot = nativeImage.createFromPath(pathToDotIcon);
            if (level !== 4) getAppWindow()?.setOverlayIcon(nidot, "dot");
            else getAppWindow()?.setOverlayIcon(null, "no-dot");
        }
    } catch (ex) {
        console.error("Failed to update tray icon:", ex);
    }
}

export function buildTrayIcon() {
    let locale = store.get("locale");
    if (locale === "auto") {
        locale = "en";
    }

    const iconPath = buildIconPath(0, false);

    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: locale === "ru" ? "Открыть" : "Show",
            click: () => {
                getAppWindow()?.show();
            },
        },
        {
            label: locale === "ru" ? "Выход" : "Quit",
            click: () => {
                getAppWindow()?.close();
                //wnd = null;
                app.quit();
            },
        },
    ]);
    tray.setToolTip("Flowerpot");
    tray.setContextMenu(contextMenu);

    tray.on("double-click", () => {
        getAppWindow()?.show();
    });
}

export function registerAutostart() {
    if (!isDev && process.platform === "win32") {
        app.setLoginItemSettings({
            openAtLogin: store.get("autostart"),
            path: app.getPath("exe"),
        });
    }
}
