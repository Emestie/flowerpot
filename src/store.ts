import { observable, action, reaction } from "mobx";
import Settings, { ISettings } from "./helpers/Settings";

type View = "loading" | "error" | "main" | "settings" | "credentials";

class Store {
    @observable view: View = "loading";
    @observable settings: ISettings = {
        tfsPath: "",
        tfsUser: "",
        tfsPwd: "",
        credentialsChecked: false,
        refreshRate: 60,
        queries: []
    };

    private onPathChange = reaction(() => this.settings.tfsPath, Settings.pushToWindow);
    private onUserChange = reaction(() => this.settings.tfsUser, Settings.pushToWindow);
    private onPwdChange = reaction(() => this.settings.tfsPwd, Settings.pushToWindow);
    private onCredsChange = reaction(() => this.settings.credentialsChecked, Settings.pushToWindow);
    private onRateChange = reaction(() => this.settings.refreshRate, Settings.pushToWindow);
    private onQueriesChange = reaction(() => this.settings.queries, Settings.pushToWindow);

    @action switchView(view: View) {
        this.view = view;
    }

    @action setSettings(settings: ISettings) {
        //merge with default ones in case of new added
        this.settings = { ...this.settings, ...settings };
    }
}

const store = new Store();
export default store;
