import { app, dialog } from "electron";
import { enableCompatMode, isCompatModeActiveForLaunch } from "./compat-mode";
import { getLogFilePath, log } from "./logger";
import { store } from "./store";

export interface IStartupFailureDetails {
    reason: string;
    exitCode?: number;
    message?: string;
}

let handled = false;

function isRussian() {
    return store.get("locale") === "ru";
}

function showStartupError(details: IStartupFailureDetails) {
    const title = isRussian() ? "Flowerpot не удалось запустить" : "Flowerpot could not start";

    const lines = [
        isRussian()
            ? "Процесс отрисовки интерфейса аварийно завершился, поэтому окно не появилось."
            : "The interface process crashed before the window could appear.",
        `${details.reason}${details.exitCode !== undefined ? `, exit ${details.exitCode}` : ""}`,
        details.message,
        "",
        isRussian() ? "Подробности записаны в файл:" : "Details were written to:",
        getLogFilePath(),
        "",
        isRussian()
            ? "Если это повторяется, отправьте этот журнал в поддержку."
            : "If this keeps happening, send this log file to support.",
    ].filter((line): line is string => typeof line === "string" && line.length > 0);

    dialog.showErrorBox(title, lines.join("\n"));
}

/**
 * A renderer that dies before the first paint is never shown (the window is
 * created with `show: false` and waits for `ready-to-show`), which used to leave
 * an invisible process holding the single-instance lock forever.
 *
 * On Windows the known cause is the Chromium sandbox failing to start on some
 * Windows 11 builds / with security software installed. The only reliable
 * workaround is `--no-sandbox`, so the app restarts itself once with it and keeps
 * that decision in compatibility mode. If the sandbox is not the cause, the
 * second attempt shows an error and exits instead of looping.
 */
export function handleStartupRendererFailure(details: IStartupFailureDetails) {
    if (handled) return;
    handled = true;

    log(
        `Startup failed: ${details.reason}` +
            `${details.exitCode !== undefined ? `, exit ${details.exitCode}` : ""}` +
            `${details.message ? ` (${details.message})` : ""}`
    );

    if ((app as any).quitting) return;

    // Only Windows needs (and gets) the sandbox workaround; on macOS the dock
    // activation path shows and reloads the window, so the process is left alive.
    if (process.platform !== "win32") {
        log("Startup failure outside Windows: leaving sandbox compatibility mode untouched");
        return;
    }

    // Either the user already passed the flag or the private relaunch is in
    // progress, so another restart would only loop.
    if (process.argv.includes("--no-sandbox") || isCompatModeActiveForLaunch()) {
        showStartupError(details);
        app.exit(1);
        return;
    }

    enableCompatMode(details.reason, details.exitCode);
    log("Restarting in compatibility mode (--no-sandbox)");
    store.flushSync();

    const args = process.argv.slice(1).filter((arg) => arg !== "--no-sandbox");
    app.relaunch({ args: [...args, "--no-sandbox"] });
    app.exit(0);
}
