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
        const json = localStorage.getItem("flowerpotSettings") || "{}";
        this.data = JSON.parse(json);
    }

    get(key: string) {
        if (this.data[key] === undefined) {
            return this.defaults[key];
        }
        return this.data[key];
    }

    set(key: string, val: any) {
        this.data[key] = val;

        const json = JSON.stringify(this.data);
        localStorage.setItem("flowerpotSettings", json);
    }
}

const webStore = new WebStore();

export default webStore;
