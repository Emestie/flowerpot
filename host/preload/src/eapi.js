import { ipcRenderer, clipboard, shell } from "electron";
const isDev = import.meta.env.DEV;
const platformName = process.platform;
export const eapi = {
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
        if (removeOld)
            ipcRenderer.removeAllListeners(channel);
        ipcRenderer.on(channel, callback);
    },
};
