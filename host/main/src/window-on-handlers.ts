import { app, BrowserWindow } from "electron";
import { markStartupSucceeded } from "./compat-mode";
import { log } from "./logger";
import { handleStartupRendererFailure } from "./startup-recovery";
import { store } from "./store";

/** ERR_ABORTED: the load was replaced by a navigation, not a failure. */
const ERR_ABORTED = -3;

/** Reloads after this many crashes in a row would only spin. */
const MAX_RUNTIME_RENDERER_CRASHES = 3;

export function setWindowOnHandlers(browserWindow: BrowserWindow) {
    /** True once the window has been painted at least once in this process. */
    let everShown = false;
    let runtimeRendererCrashes = 0;

    /**
     * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
     * it then defaults to 'true'. This can cause flickering as the window loads the html content,
     * and it also has show problematic behaviour with the closing of the window.
     * Use `show: false` and listen to the  `ready-to-show` event to show the window.
     *
     * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
     */
    browserWindow.on("ready-to-show", () => {
        everShown = true;
        browserWindow?.show();
        markStartupSucceeded();

        if (import.meta.env.DEV) {
            browserWindow?.webContents.openDevTools();
        }
    });

    browserWindow.webContents.on("did-finish-load", () => {
        runtimeRendererCrashes = 0;
    });

    /**
     * A renderer that dies before the first paint would otherwise leave the
     * window hidden forever while the process (and the single-instance lock)
     * keeps running. On Windows the usual cause is the Chromium sandbox, so the
     * startup recovery restarts once without it.
     */
    browserWindow.webContents.on("render-process-gone", (_event, details) => {
        if ((app as any).quitting) return;
        if (details.reason === "clean-exit") return;

        log(`Renderer process gone: reason=${details.reason}, exitCode=${details.exitCode}`);

        if (!everShown) {
            handleStartupRendererFailure({
                reason: `renderer ${details.reason}`,
                exitCode: details.exitCode,
            });
            return;
        }

        runtimeRendererCrashes++;

        if (runtimeRendererCrashes > MAX_RUNTIME_RENDERER_CRASHES) {
            log("Renderer keeps crashing after reloads; leaving the window as is");
            return;
        }

        log(`Reloading the window after renderer crash ${runtimeRendererCrashes}`);
        browserWindow.webContents.reload();
    });

    /**
     * A failed main-frame load without a renderer crash (missing app.asar, an
     * antivirus blocking the file) also never fires `ready-to-show`, so it has
     * to go through the same startup recovery.
     */
    browserWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        if (!isMainFrame || errorCode === ERR_ABORTED) return;

        log(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);

        if (!everShown) {
            handleStartupRendererFailure({
                reason: "load failed",
                exitCode: errorCode,
                message: `${errorDescription} ${validatedURL}`,
            });
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
