import { app, BrowserWindow, Notification } from "electron";
import { store } from "./store";

export function setWindowOnHandlers(browserWindow: BrowserWindow) {
    /**
     * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
     * it then defaults to 'true'. This can cause flickering as the window loads the html content,
     * and it also has show problematic behaviour with the closing of the window.
     * Use `show: false` and listen to the  `ready-to-show` event to show the window.
     *
     * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
     */
    browserWindow.on("ready-to-show", () => {
        browserWindow?.show();

        if (import.meta.env.DEV) {
            browserWindow?.webContents.openDevTools();
        }
    });

    //rowserWindow.on("show", () => {
    //iconUpdateTask(currentLevel, false);
    //});

    let resizeTimer: NodeJS.Timeout | undefined;
    let moveTimer: NodeJS.Timeout | undefined;

    browserWindow.on("resize", () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            let { width, height } = browserWindow.getBounds();
            store.set("windowDim", { width, height });
        }, 300);
    });

    browserWindow.on("move", () => {
        if (moveTimer) clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
            let [x, y] = browserWindow.getPosition();
            store.set("windowPos", { x, y });
        }, 300);
    });

    browserWindow.on("close", (event) => {
        if ((app as any).quitting) {
            //browserWindow = null;
        } else {
            event.preventDefault();
            browserWindow.hide();
        }
    });
}
