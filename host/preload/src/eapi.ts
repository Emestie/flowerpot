import { ipcRenderer, clipboard, shell } from "electron";

const isDev = import.meta.env.DEV;

const platformName = process.platform;

export const eapi = {
    shell,
    isDev,
    clipboard,
    platformName,
    ipcInvoke: async (channel: string, ...args: any) => {
        return await ipcRenderer.invoke(channel, ...args);
    },
    ipcSend: (channel: string, data?: any) => {
        ipcRenderer.send(channel, data);
    },
    ipcOn: (channel: string, callback: any, removeOld?: boolean) => {
        if (removeOld) ipcRenderer.removeAllListeners(channel);
        ipcRenderer.on(channel, callback);
    },
};
