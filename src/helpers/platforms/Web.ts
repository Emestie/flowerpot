import { TLocale } from "../../redux/types";
import { INotificationData, IPlatformClass } from "../Platform";
import webStore from "./web/WebStore";

export default class WebPlatform implements IPlatformClass {
    get os() {
        const ua = window.navigator.userAgent;
        if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
        if (/Android/i.test(ua)) return "android";
        if (/Windows/i.test(ua)) return "win32";
        if (/Macintosh|Mac OS X/i.test(ua)) return "darwin";
        if (/Linux/i.test(ua)) return "linux";
        return "web";
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
        if (!("Notification" in window)) {
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(data.title, { body: data.body });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    new Notification(data.title, { body: data.body });
                }
            });
        }
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
