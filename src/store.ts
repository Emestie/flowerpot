import { observable, action, reaction } from "mobx";
import Settings, { ISettings } from "./helpers/Settings";
import { IQuery } from "./helpers/Query";

type View = "loading" | "error" | "main" | "settings" | "credentials" | "selectqueries" | "debug";

class Store {
    @observable _routinesRestart: number = 0;

    @observable view: View = "loading";
    @observable errorMessage: string = "";
    @observable updateReady: boolean = false;
    @observable settings: ISettings = {
        tfsPath: "http://tfs.eos.loc:8080/tfs/DefaultCollection/",
        tfsUser: "",
        tfsPwd: "",
        credentialsChecked: false,
        refreshRate: 60,
        showNotifications: true,
        queries: []
    };

    @observable getQueries(all?: boolean) {
        let queries = this.copy<IQuery[]>(this.settings.queries).sort((a, b) => a.order - b.order);
        if (all) return queries;
        else return queries.filter(q => !!q.enabled);
    }

    private onPathChange = reaction(() => this.settings.tfsPath, Settings.pushToWindow);
    private onUserChange = reaction(() => this.settings.tfsUser, Settings.pushToWindow);
    private onPwdChange = reaction(() => this.settings.tfsPwd, Settings.pushToWindow);
    private onCredsChange = reaction(() => this.settings.credentialsChecked, Settings.pushToWindow);
    private onRateChange = reaction(() => this.settings.refreshRate, Settings.pushToWindow);
    private onNotifChange = reaction(() => this.settings.showNotifications, Settings.pushToWindow);
    private onQueriesChange = reaction(() => this.settings.queries, Settings.pushToWindow);

    @action switchView(view: View) {
        this.errorMessage = "";
        this.view = view;
    }

    @action showErrorPage(text: string) {
        this.errorMessage = text;
        this.view = "error";
    }

    @action setSettings(settings: ISettings) {
        //merge with default ones in case of new added
        this.settings = { ...this.settings, ...settings };
    }

    @action restartRoutines() {
        this._routinesRestart += 1;
    }

    copy<T = any>(val: T) {
        return JSON.parse(JSON.stringify(val)) as T;
    }
}

const store = new Store();
export default store;
