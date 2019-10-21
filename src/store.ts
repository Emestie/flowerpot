import { observable, action, reaction } from "mobx";
import Settings, { ISettings, TLists } from "./helpers/Settings";
import Query, { IQuery } from "./helpers/Query";
import Electron from "./helpers/Electron";
import { IWorkItem } from "./helpers/WorkItem";

type TView = "loading" | "error" | "main" | "settings" | "credentials" | "selectqueries" | "debug" | "lists" | "refreshhelper";
type TUpdateStatus = "none" | "downloading" | "ready" | "checking" | "error";
export type TLocale = "en" | "ru";

class Store {
    public useFishWIs = 0;

    @observable _routinesRestart: number = 0;
    @observable _permawatchUpdate: number = 0;

    @observable view: TView = "loading";
    @observable errorMessage: string = "";
    @observable updateStatus: TUpdateStatus = "none";
    @observable showWhatsNew: boolean = false;
    @observable settings: ISettings = {
        tfsPath: "http://tfs.eos.loc:8080/tfs/DefaultCollection/",
        tfsUser: "",
        tfsPwd: "",
        credentialsChecked: false,
        refreshRate: 180,
        sortPattern: "default",
        notificationsMode: "all",
        iconChangesOnMyWorkItemsOnly: false,
        mineOnTop: true,
        queries: [],
        lists: {
            permawatch: [],
            favorites: [],
            deferred: [],
            hidden: [],
        },
        notes: [],
        darkTheme: false,
        allowTelemetry: true,
        showWhatsNewOnUpdate: true,
        lastTimeVersion: "",
        lastTimeVersionLong: "",
    };
    //! if add something in settings outfise of flowerpot section don't forget to add reaction
    @observable autostart: boolean = true;
    @observable locale: TLocale = "en";

    isEosTfs() {
        return this.settings.tfsPath.toLowerCase().indexOf("tfs.eos.loc:8080") !== -1;
    }

    getQueries(all?: boolean) {
        let queries = this.copy<IQuery[]>(this.settings.queries).sort((a, b) => a.order - b.order);
        if (all) return queries;
        if (this.getList("permawatch").length) queries.push(Query.getFakePermawatchQuery());
        return queries.filter(q => !!q.enabled);
    }

    getList(list: TLists) {
        return this.copy(this.settings.lists[list]).sort((a, b) => a.id - b.id);
    }

    getAllLists() {
        return [...this.getList("deferred"), ...this.getList("favorites"), ...this.getList("hidden"), ...this.getList("permawatch")];
    }

    @observable _changesCollection: any = {};
    getWIHasChanges(workItem: IWorkItem) {
        return !!this._changesCollection[workItem.id];
    }

    intervalStorage = {};
    @observable errorInterval: any = undefined;

    private onListsPChange = reaction(
        () => this.settings.lists.permawatch.length,
        () => {
            if (this.settings.lists.permawatch.length) this._permawatchUpdate += 1;
            Settings.save();
        }
    );
    private onSettingsChange = reaction(() => this.settings, Settings.save);
    private onLocaleChange = reaction(() => this.locale, Electron.changeLocale);
    private onAutostartChange = reaction(() => this.autostart, Electron.toggleAutostart);

    @action switchView(view: TView) {
        this.errorMessage = "";
        this.view = view;
    }

    @action showErrorPage(text: string) {
        this.errorMessage = text;
        this.view = "error";
    }

    @action setSettings(settings: ISettings) {
        this.settings = { ...this.settings, ...settings };
    }

    @action updateSettings(settings?: ISettings) {
        const newSettings = this.copy(settings || this.settings);
        this.settings = newSettings;
    }

    @action restartRoutines() {
        this._routinesRestart += 1;
    }

    @action setWIHasChanges(workItem: IWorkItem, hasChanges: boolean) {
        this._changesCollection[workItem.id] = hasChanges;
    }

    getInterval(query: IQuery): NodeJS.Timeout | null {
        let interval = (this.intervalStorage as any)[query.queryId];
        if (interval) return (this.intervalStorage as any)[query.queryId];
        else return null;
    }

    setInterval(query: IQuery, interval: NodeJS.Timeout) {
        (this.intervalStorage as any)[query.queryId] = interval;
    }

    clearInterval(query: IQuery) {
        if ((this.intervalStorage as any)[query.queryId]) {
            clearInterval((this.intervalStorage as any)[query.queryId]);
            (this.intervalStorage as any)[query.queryId] = undefined;
        }
    }

    copy<T = any>(val: T) {
        return JSON.parse(JSON.stringify(val)) as T;
    }
}

const store = new Store();
export default store;
