export default class Settings {
    public static get(name: string) {
        let storage = (window as any).flowerpotSettingsStorage;
        if (!storage) return undefined;
        return storage[name];
    }

    public static set(name: string, value: any) {
        let storage = (window as any).flowerpotSettingsStorage;
        if (!storage) (window as any).flowerpotSettingsStorage = {};
        (window as any).flowerpotSettingsStorage[name] = value;
    }
}
