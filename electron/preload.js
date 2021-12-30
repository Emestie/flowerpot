const { contextBridge, ipcRenderer, clipboard, shell } = require("electron");

(async function () {
    const isDev = await ipcRenderer.invoke("read-is-dev");

    const platformName = process.platform;

    contextBridge.exposeInMainWorld("eapi", {
        shell,
        isDev,
        clipboard,
        platformName,
        ipcInvoke: async (channel, ...args) => {
            return await ipcRenderer.invoke(channel, ...args);
        },
        ipcSend: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        ipcOn: (channel, callback, removeOld) => {
            if (removeOld) ipcRenderer.removeAllListeners(channel);
            ipcRenderer.on(channel, callback);
        },
    });
})();
