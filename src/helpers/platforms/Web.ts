import { IPlatformExtension } from "../Platform";
import CommonPlatform from "./_Common";

export default class WebPlatform extends CommonPlatform implements IPlatformExtension {
    public isLocal() {
        return false;
    }

    //TODO implement local store
    public getSettingsStorage() {}

    public getStoreProp(prop: string) {
        let store = this.getSettingsStorage();
        if (store) return store.get(prop);
    }

    public setStoreProp(prop: string, value: any) {
        let store = this.getSettingsStorage();
        if (store) store.set(prop, value, true);
        this.sendIpcRenderer("save-settings-prop", { prop, value });
    }

    public openUrl(url: string) {}

    public checkForUpdates(cyclic?: boolean) {}
}
