const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron");
const path = require("path");
const url = require("url");

const Store = require("./store");

const store = new Store({
    configName: "settings",
    defaults: {
        windowDim: {
            width: 800,
            height: 600
        },
        windowPos: {
            x: undefined,
            y: undefined
        }
    }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let wnd;
let tray;

function createWindow() {
    let { width, height } = store.get("windowDim");
    let { x, y } = store.get("windowPos");

    // Create the browser window.
    wnd = new BrowserWindow({
        title: "Flowerpot",
        icon: __dirname + "/../_icons/flower4.png",
        width: width,
        height: height,
        minWidth: 800,
        minHeight: 600,
        x: x,
        y: y,
        webPreferences: { webSecurity: false, preload: __dirname + "/preload.js" }
    });

    if (process.env.NODE_ENV === "production") wnd.setMenu(null);

    const startUrl =
        process.env.ELECTRON_START_URL ||
        url.format({
            pathname: path.join(__dirname, "/../build/index.html"),
            protocol: "file:",
            slashes: true
        });
    wnd.loadURL(startUrl);

    buildTrayIcon();

    ipcMain.on("update-icon", (e, level) => {
        if (!tray || !level || !+level || level < 1 || level > 4) return;
        tray.setImage(__dirname + "/../_icons/flower" + level + ".png");
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

app.on("activate", () => {
    if (wnd === null) {
        createWindow();
    }
});

function buildTrayIcon() {
    tray = new Tray(__dirname + "/../_icons/flower4.png");
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show",
            click: () => {
                wnd.show();
            }
        },
        {
            label: "Quit",
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
