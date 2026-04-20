import { eapi } from "#preload";
import { TLocale } from "../../types";
import { INotificationData, IPlatformClass, OS } from "../Platform";
import { useAppStore } from "../../zustand/app";

export default class ElectronPlatform implements IPlatformClass {
    public get os() {
        return eapi.platformName as OS;
    }

    public async getStoreProp<T = unknown>(prop: string) {
        const val = await eapi.ipcInvoke("read-settings-prop", prop);
        return val as T;
    }

    public setStoreProp(prop: string, value: any) {
        eapi.ipcSend("save-settings-prop", { prop, value });
    }

    public copyString(s: string) {
        eapi.clipboardWriteText(s);
    }

    public changeLocale(locale: TLocale) {
        this.setStoreProp("locale", locale);
    }

    public toggleAutostart(autostart: boolean) {
        this.setStoreProp("autostart", autostart);
        eapi.ipcSend("toggle-autostart");
    }

    public updateTrayIcon(level: number, hasChanges?: boolean) {
        if (!level || !+level || level > 4 || level < 1) level = 0;
        eapi.ipcSend("update-icon", {
            level: level,
            hasChanges: !!hasChanges,
        });
    }

    public updateTrayIconDot(hasChanges: boolean) {
        eapi.ipcSend("update-icon-dot-only", !!hasChanges);
    }

    public isDev() {
        return eapi.isDev;
    }

    public toggleConsole() {
        //if ((window as any).electronRemote) (window as any).electronRemote.getCurrentWindow().toggleDevTools();
        eapi.ipcSend("toggle-dev-tools");
    }

    public updateApp() {
        eapi.ipcSend("update-app");

        // if (Platform.current.os === "darwin") {
        //     this.openUrl("https://github.com/Emestie/flowerpot/releases/latest");
        // }
    }

    public showNotification(data: INotificationData) {
        eapi.ipcSend("show-notification", data);
    }

    public reactIsReady() {
        eapi.ipcSend("react-is-ready");
    }

    public isLocal() {
        return false; //!web local temp
        //return document.location.href.indexOf("build") !== -1;
    }

    public openUrl(url: string) {
        eapi.shellOpenExternal(url);
    }

    public checkForUpdates(cyclic?: boolean) {
        //const { updateStatus, view } = store.getState().app;

        if (cyclic) {
            setInterval(
                () => {
                    this.checkForUpdates();
                },
                1000 * 60 * 60
            );

            //!web update
            // setInterval(() => {
            //     if (updateStatus !== "ready" && updateStatus !== "downloading" && !this.isDev() && view === "main") {
            //         const href =
            //             "https://flowerpot-pwa.web.app/firebase-entry-point.html?salt=x" +
            //             Math.floor(Math.random() * 100000000);
            //         document.location.href = href;
            //     }
            // }, 1000 * 60 * 61);
        }

        eapi.ipcSend("check-for-updates");
    }

    public initUpdateListeners() {
        eapi.ipcOn("checking_for_update", () => {
            useAppStore.getState().setUpdateStatus("checking");
        });
        eapi.ipcOn("update_not_available", () => {
            useAppStore.getState().setUpdateStatus("none");
        });
        eapi.ipcOn("update_available", () => {
            useAppStore.getState().setUpdateStatus("downloading");
        });
        eapi.ipcOn("update_downloaded", () => {
            useAppStore.getState().setUpdateStatus("ready");
        });
        eapi.ipcOn("update_error", () => {
            useAppStore.getState().setUpdateStatus("error");
        });
    }
}
