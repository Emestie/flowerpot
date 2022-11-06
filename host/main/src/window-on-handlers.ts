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

    browserWindow.on("resize", () => {
        let { width, height } = browserWindow.getBounds();
        store.set("windowDim", { width, height });
    });

    browserWindow.on("move", () => {
        let [x, y] = browserWindow.getPosition();
        store.set("windowPos", { x, y });
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
