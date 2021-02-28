import Platform, { PlatformType } from "../Platform";

export default class CommonPlatform {
    public isLocal() {
        if (Platform.current.type === PlatformType.Electron) return document.location.href.indexOf("build") !== -1;
        else return false;
    }
}
