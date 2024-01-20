import { api } from "../api/client";
import { store } from "../redux/store";

export default class Loaders {
    public static async checkCredentials() {
        try {
            await api.collection.getAll();
            return true;
        } catch (ex: any) {
            return false;
        }
    }

    public static async checkTfsPath() {
        try {
            let res = await fetch(store.getState().settings.tfsPath);
            if (res.status !== 401 && res.status !== 200) return false;
            else return true;
        } catch (ex: any) {
            return false;
        }
    }
}
