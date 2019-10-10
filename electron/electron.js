const { app, ipcMain, Menu, Tray, Notification, globalShortcut } = require("electron");
const Splashscreen = require("@trodi/electron-splashscreen");
const { autoUpdater } = require("electron-updater");
const isDev = require("electron-is-dev");
const path = require("path");
const url = require("url");

const Store = require("./common/store");
const storeDefaults = require("./common/store-defaults");
const store = new Store(storeDefaults);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let wnd;
let tray;

app.requestSingleInstanceLock();

function createWindow() {
    let { width, height } = store.get("windowDim");
    let { x, y } = store.get("windowPos");
    let currentLevel = 4;

    if (process.platform === "win32") {
        app.setAppUserModelId("mst.flowerpot");
    }

    registerAutostart();

    const windowOptions = {
        title: "Flowerpot",
        icon: buildIconPath(4),
        width: width,
        height: height,
        minWidth: 800,
        minHeight: 600,
        x: x,
        y: y,
        webPreferences: { webSecurity: false, preload: __dirname + "/common/preload.js" }
    };
    const splashCfg = {
        windowOpts: windowOptions,
        templateUrl: `${__dirname}/splash-screen/splash-screen.html`,
        splashScreenOpts: {
            width: 260,
            height: 100
        }
    };

    wnd = Splashscreen.initSplashScreen(splashCfg);

    if (!isDev) wnd.setMenu(null);

    wnd.loadURL(getStartingUrl());

    buildTrayIcon();

    globalShortcut.register("CommandOrControl+Shift+8", () => {
        wnd.toggleDevTools();
    });

    ipcMain.on("update-icon", (e, { level, hasChanges }) => {
        if (!tray || !level || !+level || level < 1 || level > 4) return;
        currentLevel = level;
        iconUpdateTask(level, hasChanges);
    });

    ipcMain.on("check-for-updates", () => {
        autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.on("update-app", () => {
        autoUpdater.quitAndInstall();
    });

    ipcMain.on("show-notification", (e, data) => {
        data.icon = buildIconPath(currentLevel);
        let notif = new Notification(data);
        notif.on("click", () => {
            wnd.show();
        });
        notif.show();
    });

    ipcMain.on("toggle-autostart", () => {
        registerAutostart();
    });

    ipcMain.on("react-is-ready", () => {
        iconUpdateTask(currentLevel, false);
    });

    ipcMain.on("save-settings-prop", (e, data) => {
        store.set(data.prop, data.value);
    });

    wnd.webContents.on("did-fail-load", function() {
        const loadUrl = url.format({
            pathname: path.join(__dirname, "/../build/index.html"),
            protocol: "file:",
            slashes: true
        });
        console.log("did-fail-load", loadUrl);
        wnd.loadURL(loadUrl + "#628");
    });

    wnd.on("show", () => {
        iconUpdateTask(currentLevel, false);
    });

    wnd.on("resize", () => {
        let { width, height } = wnd.getBounds();
        store.set("windowDim", { width, height });
    });

    wnd.on("move", () => {
        let [x, y] = wnd.getPosition();
        store.set("windowPos", { x, y });
    });

    wnd.on("close", event => {
        if (app.quitting) {
            wnd = null;
        } else {
            event.preventDefault();
            wnd.hide();
        }
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {});

app.on("before-quit", () => (app.quitting = true));

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});

app.on("activate", () => {
    if (wnd === null) {
        createWindow();
    }
});

app.on("second-instance", (event, argv, cwd) => {
    if (wnd) {
        if (wnd.isMinimized()) wnd.restore();
        wnd.focus();
    }

    app.quit();
});

autoUpdater.on("checking-for-update", () => {
    wnd.webContents.send("checking_for_update");
});

autoUpdater.on("update-not-available", () => {
    wnd.webContents.send("update_not_available");
});

autoUpdater.on("download-progress", data => {
    wnd.webContents.send("download_progress", data);
});

autoUpdater.on("update-available", () => {
    wnd.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
    wnd.webContents.send("update_downloaded");
});

autoUpdater.on("error", () => {
    wnd.webContents.send("update_error");
});

function iconUpdateTask(level, hasChanges) {
    let pathToIcon = buildIconPath(level, hasChanges);
    tray.setImage(pathToIcon);

    let pathToDotIcon = buildIconDotPath(level, hasChanges);
    if (level !== 4) wnd.setOverlayIcon(pathToDotIcon, "dot");
    else wnd.setOverlayIcon(null, "no-dot");
}

function buildTrayIcon() {
    let locale = store.get("locale");
    if (locale === "auto") {
        locale = "en";
    }

    tray = new Tray(buildIconPath(4, false));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: locale === "ru" ? "Открыть" : "Show",
            click: () => {
                wnd.show();
            }
        },
        {
            label: locale === "ru" ? "Выход" : "Quit",
            click: () => {
                wnd.close();
                wnd = null;
                app.quit();
            }
        }
    ]);
    tray.setToolTip("Flowerpot");
    tray.setContextMenu(contextMenu);

    tray.on("double-click", () => {
        wnd.show();
    });
}

function buildIconPath(level, hasChanges) {
    if (hasChanges) level = level + "d";
    return __dirname + "/../_icons/flower" + level + ".ico";
}

function buildIconDotPath(level, hasChanges) {
    return __dirname + "/../_icons/dots/dot" + level + ".png";
}

function registerAutostart() {
    if (!isDev) {
        app.setLoginItemSettings({
            openAtLogin: store.get("autostart"),
            path: app.getPath("exe")
        });
    }
}

function getStartingUrl() {
    //three types of starting urls.
    //If it is dev - use dev. If internet available - use latest web version.
    //If internet is down - use latest local version with flag to not rewrite saved telemetry version (see event)
    const startUrl = process.env.ELECTRON_START_URL || "https://flowerpot-pwa.web.app/#628";
    return startUrl;
}
