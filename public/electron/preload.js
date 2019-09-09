window.ipcRenderer = require("electron").ipcRenderer;
window.shell = require("electron").shell;
window.isDev = require("electron-is-dev");
const ElectronStore = require("./store");
const eleStore = new ElectronStore(require("./store-defaults"));
window.electronStore = eleStore;
