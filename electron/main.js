const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let wnd;

function createWindow() {
    // Create the browser window.
    wnd = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        x: 100,
        y: 100,
        webPreferences: { webSecurity: false }
    });

    const startUrl =
        process.env.ELECTRON_START_URL ||
        url.format({
            pathname: path.join(__dirname, "/../build/index.html"),
            protocol: "file:",
            slashes: true
        });
    wnd.loadURL(startUrl);

    //TODO: on ready try to load settings
    //TODO: if dev env get setting from some predefined json

    // Emitted when the window is closed.
    wnd.on("closed", () => {
        //TODO: save settings
        wnd = null;
    });
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (wnd === null) {
        createWindow();
    }
});
