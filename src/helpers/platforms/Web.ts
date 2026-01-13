import { TLocale } from "../../redux/types";
import { INotificationData, IPlatformClass, OS } from "../Platform";
import webStore from "./web/WebStore";

export default class WebPlatform implements IPlatformClass {
    get os() {
        return "web" as OS;
    }

    getStoreProp<T = unknown>(prop: string) {
        return webStore.get<T>(prop);
    }

    setStoreProp<T>(prop: string, value: T) {
        webStore.set(prop, value);
    }

    copyString(s: string) {
        navigator.clipboard.writeText(s);
    }

    changeLocale(locale: TLocale) {
        this.setStoreProp("locale", locale);
    }

    toggleAutostart(autostart: boolean) {
        // not needed in web platform
    }

    updateTrayIcon(level: number, hasChanges?: boolean | undefined) {
        // not needed in web platform
    }

    updateTrayIconDot(hasChanges: boolean) {
        // not needed in web platform
    }

    isDev() {
        return window.location.href.includes("localhost");
    }

    toggleConsole() {
        // not needed in web platform
    }

    updateApp() {
        // not needed in web platform
    }

    showNotification(data: INotificationData) {
        //TODO: notif
    }

    reactIsReady() {
        // not needed in web platform
    }

    initUpdateListeners() {
        // not needed in web platform
    }

    public isLocal() {
        return false;
    }

    public openUrl(url: string) {
        window.open(url, "_blank");
    }

    public checkForUpdates(cyclic?: boolean) {
        // not needed in web platform
    }
}
