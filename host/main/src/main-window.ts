import { app, BrowserWindow, globalShortcut, Menu, MenuItemConstructorOptions } from "electron";
import { join } from "path";
import { pathToFileURL } from "url";
import { buildIconPath, buildTrayIcon, registerAutostart } from "./functions";
import { log } from "./logger";
import { handleStartupRendererFailure } from "./startup-recovery";
import { store } from "./store";
import { setWindowOnHandlers } from "./window-on-handlers";

function setMacOSMenu() {
    if (process.platform !== "darwin") return;

    const menuTemplate: MenuItemConstructorOptions[] = [
        {
            label: app.name,
            submenu: [
                { role: "about", label: "About" },
                { type: "separator" },
                { role: "quit", label: "Quit Flowerpot" },
            ],
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "togglefullscreen" },
            ],
        },
        {
            label: "Window",
            submenu: [
                { role: "minimize" },
                { role: "zoom" },
                { type: "separator" },
                { role: "front" },
                { type: "separator" },
                { role: "window" },
            ],
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

async function createWindow() {
    let { width, height } = store.get("windowDim");
    let { x, y } = store.get("windowPos");

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

    const browserWindow = new BrowserWindow(windowOptions);

    setMacOSMenu();

    if (process.platform !== "darwin") {
        browserWindow.setMenu(null);
    }

    setWindowOnHandlers(browserWindow);

    globalShortcut.register("CommandOrControl+Shift+8", () => {
        browserWindow.webContents.openDevTools();
    });

    /**
     * URL for main window.
     * Vite dev server for development.
     * `file://../renderer/index.html` for production and test.
     */
    const pageUrl =
        import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
            ? import.meta.env.VITE_DEV_SERVER_URL
            : pathToFileURL(join(__dirname, "../../../build/index.html")).toString();

    // Build the tray before loading the page: the renderer sends "react-is-ready"
    // from its very first effect (twice in dev, React StrictMode), which can land
    // before loadURL resolves. Creating the tray afterwards left `tray` undefined
    // when that IPC arrived, logging "Failed to update tray icon: ... setImage".
    buildTrayIcon();

    try {
        await browserWindow.loadURL(pageUrl);
    } catch (e: any) {
        log("Failed to load the main window:", e);

        // A navigation replaced this load; the replacement will paint the window.
        if (e && e.code === "ERR_ABORTED") {
            return browserWindow;
        }

        // `render-process-gone` / `did-fail-load` normally started the recovery
        // already. This catch is the last resort for a failure that fired neither
        // event — the window must never stay hidden with the app running.
        handleStartupRendererFailure({ reason: "loadURL rejected", message: String(e) });
    }

    return browserWindow;
}

/**
 * Brings the existing window back into view. `focus()` alone does nothing on
 * Windows when the window is hidden, which made every click on the shortcut
 * silently do nothing after a failed startup.
 */
function revealWindow(window: BrowserWindow) {
    if (window.isDestroyed()) return;

    if (window.isMinimized()) {
        window.restore();
    }

    if (!window.webContents.isDestroyed() && window.webContents.isCrashed()) {
        log("Reloading a crashed window");
        window.webContents.reload();
    }

    if (!window.isVisible()) {
        window.show();
    }

    window.focus();
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
    let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

    if (window === undefined) {
        window = await createWindow();
    }

    revealWindow(window);
}

/** Shows the window from the tray menu, a notification or the second instance. */
export function showAppWindow() {
    const window = getAppWindow();
    if (window !== undefined) revealWindow(window);
}

export function getAppWindow() {
    const window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
    return window;
}
