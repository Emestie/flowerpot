import { observable, action, reaction } from "mobx";
import Settings, { ISettings, TLists } from "./helpers/Settings";
import Query, { IQuery } from "./helpers/Query";
import Platform from "./helpers/Platform";
import { IWorkItem } from "./helpers/WorkItem";
import { Eve } from "./helpers/Festival";

export type TView = "loading" | "error" | "main" | "settings" | "credentials" | "selectqueries" | "debug" | "lists" | "refreshhelper";
export type TUpdateStatus = "none" | "downloading" | "ready" | "checking" | "error";
export type TLocale = "en" | "ru";

class Store {
    public useFishWIs = 0;

    @observable _routinesRestart: number = 0;
    @observable _permawatchUpdate: number = 0;

    @observable allWorkItems: IWorkItem[] = [];

    @observable view: TView = "loading";
    @observable errorMessage: string = "";
    @observable updateStatus: TUpdateStatus = "none";
    @observable showWhatsNew: boolean = false;
    @observable settings: ISettings = {
        tfsPath: "http://tfs:8080/tfs/",
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
            keywords: [],
            pinned: [],
        },
        notes: [],
        links: [],
        darkTheme: false,
        allowTelemetry: true,
        showWhatsNewOnUpdate: true,
        showUnreads: true,
        showAvatars: true,
        showQuickLinks: true,
        lastTimeVersion: "",
        lastTimeVersionLong: "",
        migrationsDone: [],
        bannersShown: [],
    };
    //! if add something in settings outfise of flowerpot section don't forget to add reaction
    @observable autostart: boolean = true;
    @observable locale: TLocale = "en";

    @observable dialogs = {
        openById: false,
        feedback: false,
        addLink: false,
    };

    @observable loadingInProgressList: string[] = [];
    @observable isFestivalOn: boolean = false;
    @observable currentFestival: Eve = Eve._none;
    @observable festivalHeaderOffset: number = 0;

    isEosTfs() {
        return this.settings.tfsPath.toLowerCase().indexOf("tfs.eos.loc:8080") !== -1;
    }

    getQueries(all?: boolean) {
        let queries = this.copy<IQuery[]>(this.settings.queries).sort((a, b) => a.order - b.order);
        if (all) return queries;
        if (this.getList("permawatch").length) queries.push(Query.getFakePermawatchQuery());
        return queries.filter((q) => !!q.enabled);
    }

    getList(list: TLists) {
        return this.copy(this.settings.lists[list] || []).sort((a, b) => {
            if (list !== "keywords") return a.id - b.id;
            else return 0;
        });
    }

    getAllLists() {
        return [
            ...this.getList("deferred"),
            ...this.getList("favorites"),
            ...this.getList("hidden"),
            ...this.getList("permawatch"),
            ...this.getList("keywords"),
        ];
    }

    @observable _changesCollection: any = {};
    getWIHasChanges(workItem: IWorkItem) {
        return !!this._changesCollection[workItem.id];
    }
    private changesCollectionReaction = reaction(
        () => JSON.stringify(this._changesCollection),
        () => {
            Platform.current.updateTrayIconDot(this.isChangesCollectionHasItems());
        }
    );

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
    private onLocaleChange = reaction(() => this.locale, Platform.current.changeLocale);
    private onAutostartChange = reaction(() => this.autostart, Platform.current.toggleAutostart);

    @observable isChangesCollectionHasItems() {
        let hasItems = false;
        let ccx = this.copy(this._changesCollection);
        for (let x in ccx) {
            if (ccx[x]) hasItems = true;
            break;
        }
        return hasItems;
    }

    @observable getWorkItemsForQuery(query: IQuery) {
        return this.allWorkItems.filter((wi) => wi._queryId === query.queryId);
    }

    @observable setWorkItemsForQuery(query: IQuery, items: IWorkItem[]) {
        const oldItems = this.allWorkItems.filter((wi) => wi._queryId !== query.queryId);

        this.allWorkItems = [...oldItems, ...items];
    }

    @action switchView(view: TView) {
        this.errorMessage = "";
        this.view = view;

        const pageCollection = document.getElementsByClassName("Page");
        if (pageCollection && pageCollection[0]) pageCollection[0].scrollIntoView();
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
        //thin place
    }

    @action restartRoutines() {
        this._routinesRestart += 1;
    }

    @action setWIHasChanges(workItem: IWorkItem, hasChanges: boolean) {
        let cc = this.copy(this._changesCollection);
        cc[workItem.id] = hasChanges ? true : undefined;
        this._changesCollection = cc;
        localStorage.setItem("WIChangesCollection", JSON.stringify(cc));
    }

    @action clearAllChanges() {
        let cc = {};
        this._changesCollection = cc;
        localStorage.setItem("WIChangesCollection", JSON.stringify(cc));
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
