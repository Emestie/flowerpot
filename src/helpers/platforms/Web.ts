// import { TLocale } from "../../redux/types";
// import { INotificationData, IPlatformExtension } from "../Platform";
// import WebStore from "./web/WebStore";
// import CommonPlatform from "./_Common";

// export default class WebPlatform extends CommonPlatform implements IPlatformExtension {
//     getStoreProp(prop: string) {
//         return Promise.resolve("");
//     }
//     setStoreProp(prop: string, value: any) {}
//     copyString(s: string) {}
//     changeLocale(locale: TLocale) {}
//     toggleAutostart(autostart: boolean) {}
//     updateTrayIcon(level: number, hasChanges?: boolean | undefined) {}
//     updateTrayIconDot(hasChanges: boolean) {}
//     isDev() {
//         return true;
//     }
//     toggleConsole() {}
//     updateApp() {}
//     showNativeNotif(data: INotificationData) {}
//     reactIsReady() {}

//     get os(): string {
//         return "web";
//     }

//     initUpdateListeners() {}

//     public isLocal() {
//         return false;
//     }

//     //TODO implement local store
//     public getSettingsStorage() {
//         return WebStore;
//     }

//     public openUrl(url: string) {}

//     public checkForUpdates(cyclic?: boolean) {}
// }
export {};
