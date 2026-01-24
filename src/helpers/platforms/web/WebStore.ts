const LS_KEY = "@settings";

class WebStore {
    data: any = {};

    defaults: any = {
        windowDim: {
            width: 800,
            height: 600,
        },
        windowPos: {
            x: undefined,
            y: undefined,
        },
        autostart: true,
        locale: "en",
        flowerpot: undefined,
    };

    constructor() {
        const json = localStorage.getItem(LS_KEY) || "{}";
        this.data = JSON.parse(json);

        if (!this.data.installationID) {
            let iid = "";

            for (let i = 0; i < 6; i++) {
                if (i < 3) iid += String.fromCharCode(Math.random() * 26 + 65);
                else iid += String.fromCharCode(Math.random() * 10 + 48);
            }

            this.set("installationID", "FLW-" + iid);
        }
    }

    get<T>(key: string): T {
        if (this.data[key] === undefined) {
            return this.defaults[key] as T;
        }
        return this.data[key] as T;
    }

    set<T>(key: string, val: T) {
        this.data[key] = val;

        const json = JSON.stringify(this.data);
        localStorage.setItem(LS_KEY, json);
    }
}

const webStore = new WebStore();

export default webStore;
