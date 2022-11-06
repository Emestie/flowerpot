import { app, BrowserWindow } from "electron";
import { join } from "path";
import { URL } from "url";
import { buildIconPath, buildTrayIcon, registerAutostart } from "./functions";
import { store } from "./store";
import { setWindowOnHandlers } from "./window-on-handlers";
const Splashscreen = require("@trodi/electron-splashscreen");

async function createWindow() {
    let { width, height } = store.get("windowDim");
    let { x, y } = store.get("windowPos");

    app.setAppUserModelId("mst.flowerpot");

    registerAutostart();

    const windowOptions: Electron.BrowserWindowConstructorOptions = {
        show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
        title: "Flowerpot",
        icon: process.platform === "darwin" ? undefined : buildIconPath(4),
        width,
        height,
        minWidth: 900,
        minHeight: 700,
        x,
        y,
        webPreferences: {
            webSecurity: false,
            webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
            preload: join(__dirname, "../../preload/dist/index.cjs"),
        },
    };

    const splashCfg = {
        windowOpts: windowOptions,
        templateUrl: `${__dirname}/../../../build-resources/splash-screen/splash-screen.html`,
        splashScreenOpts: {
            width: 260,
            height: 100,
        },
    };

    const browserWindow = Splashscreen.initSplashScreen(splashCfg) as BrowserWindow;

    if (import.meta.env.PROD) browserWindow.setMenu(null);

    setWindowOnHandlers(browserWindow);

    /**
     * URL for main window.
     * Vite dev server for development.
     * `file://../renderer/index.html` for production and test.
     */
    const pageUrl =
        import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
            ? import.meta.env.VITE_DEV_SERVER_URL
            : new URL("../../build/index.html", "file://" + __dirname).toString();

    await browserWindow.loadURL(pageUrl);

    buildTrayIcon();

    return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
    let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

    if (window === undefined) {
        window = await createWindow();
    }

    if (window.isMinimized()) {
        window.restore();
    }

    if (process.platform === "darwin" && window) {
        window.show();
    }

    window.focus();
}

export function getAppWindow() {
    const window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
    return window;
}
