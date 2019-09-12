import { observable, action, reaction } from "mobx";
import Settings, { ISettings, TLists } from "./helpers/Settings";
import Query, { IQuery } from "./helpers/Query";
import Electron from "./helpers/Electron";
import { IWorkItem } from "./helpers/WorkItem";

type TView = "loading" | "error" | "main" | "settings" | "credentials" | "selectqueries" | "debug" | "lists";
type TUpdateStatus = "none" | "downloading" | "ready" | "checking";
export type TLocale = "auto" | "en" | "ru";

class Store {
    @observable _routinesRestart: number = 0;
    @observable _permawatchUpdate: number = 0;

    @observable view: TView = "loading";
    @observable errorMessage: string = "";
    @observable updateStatus: TUpdateStatus = "none";
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
    };
    //! if add something in settings don't forget to add reaction
    @observable autostart: boolean = true;
    @observable locale: TLocale = "auto";

    @observable getQueries(all?: boolean) {
        let queries = this.copy<IQuery[]>(this.settings.queries).sort((a, b) => a.order - b.order);
        if (all) return queries;
        if (this.getList("permawatch").length) queries.push(Query.getFakePermawatchQuery());
        return queries.filter(q => !!q.enabled);
    }
    @observable _changesCollection: any = {};
    @observable getWIHasChanges(workItem: IWorkItem) {
        return !!this._changesCollection[workItem.id];
    }
    @observable getList(list: TLists) {
        return this.copy(this.settings.lists[list]).sort((a, b) => a.id - b.id);
    }
    @observable getAllLists() {
        return [...this.getList("deferred"), ...this.getList("favorites"), ...this.getList("hidden"), ...this.getList("permawatch")];
    }

    intervalStorage = {};

    private onPathChange = reaction(() => this.settings.tfsPath, Settings.pushToWindow);
    private onUserChange = reaction(() => this.settings.tfsUser, Settings.pushToWindow);
    private onPwdChange = reaction(() => this.settings.tfsPwd, Settings.pushToWindow);
    private onCredsChange = reaction(() => this.settings.credentialsChecked, Settings.pushToWindow);
    private onRateChange = reaction(() => this.settings.refreshRate, Settings.pushToWindow);
    private onNotifChange = reaction(() => this.settings.notificationsMode, Settings.pushToWindow);
    private onIconEventsChange = reaction(() => this.settings.iconChangesOnMyWorkItemsOnly, Settings.pushToWindow);
    private onMineOnTopChange = reaction(() => this.settings.mineOnTop, Settings.pushToWindow);
    private onListsDChange = reaction(() => this.settings.lists.deferred.length, Settings.pushToWindow);
    private onListsFChange = reaction(() => this.settings.lists.favorites.length, Settings.pushToWindow);
    private onListsHChange = reaction(() => this.settings.lists.hidden.length, Settings.pushToWindow);
    private onListsPChange = reaction(
        () => this.settings.lists.permawatch.length,
        () => {
            if (this.settings.lists.permawatch.length) this._permawatchUpdate += 1;
            Settings.pushToWindow();
        }
    );
    private onQueriesChange = reaction(() => this.settings.queries, Settings.pushToWindow);
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
        //merge with default ones in case of new added
        this.settings = { ...this.settings, ...settings };
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
