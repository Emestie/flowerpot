import { appUpdateStatusSet } from "../../redux/actions/appActions";
import { store } from "../../redux/store";
import { TLocale } from "../../redux/types";
import Platform, { INotificationData, IPlatformExtension } from "../Platform";
import { Stats, UsageStat } from "../Stats";
import CommonPlatform from "./_Common";
import { eapi } from "#preload";

export default class ElectronPlatform extends CommonPlatform implements IPlatformExtension {
    public get os() {
        return eapi.platformName;
    }

    public async getStoreProp<T = unknown>(prop: string) {
        const val = await eapi.ipcInvoke("read-settings-prop", prop);
        return val as T;
    }

    public setStoreProp(prop: string, value: any) {
        eapi.ipcSend("save-settings-prop", { prop, value });
    }

    public copyString(s: string) {
        eapi.clipboard.writeText(s);
    }

    public changeLocale(locale: TLocale) {
        Platform.current.setStoreProp("locale", locale);
    }

    public toggleAutostart(autostart: boolean) {
        Platform.current.setStoreProp("autostart", autostart);
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
        Stats.increment(UsageStat.AppVersionsUpdated);

        eapi.ipcSend("update-app");

        // if (Platform.current.os === "darwin") {
        //     this.openUrl("https://github.com/Emestie/flowerpot/releases/latest");
        // }
    }

    public showNativeNotif(data: INotificationData) {
        Stats.increment(UsageStat.NotificationsSent);
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
        eapi.shell.openExternal(url);
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
            store.dispatch(appUpdateStatusSet("checking"));
        });
        eapi.ipcOn("update_not_available", () => {
            store.dispatch(appUpdateStatusSet("none"));
        });
        eapi.ipcOn("update_available", () => {
            store.dispatch(appUpdateStatusSet("downloading"));
        });
        eapi.ipcOn("update_downloaded", () => {
            store.dispatch(appUpdateStatusSet("ready"));
        });
        eapi.ipcOn("update_error", () => {
            store.dispatch(appUpdateStatusSet("error"));
        });
    }
}
