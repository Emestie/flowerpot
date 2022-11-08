const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const userDataPath = app.getPath("userData");

const storeDefaults = {
    configName: "settings",
    defaults: {
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
    },
};

class Store {
    constructor(opts: any, userDataPath: any) {
        (this as any).path = path.join(userDataPath, opts.configName + ".json");
        (this as any).defaults = opts.defaults;
        (this as any).data = parseDataFile((this as any).path, opts.defaults);

        if (!(this as any).data.installationID) {
            let iid = "";

            for (let i = 0; i < 6; i++) {
                if (i < 3) iid += String.fromCharCode(Math.random() * 26 + 65);
                else iid += String.fromCharCode(Math.random() * 10 + 48);
            }

            (this as any).set("installationID", "FLW-" + iid);
        }
    }

    get(key: any) {
        if ((this as any).data[key] === undefined) {
            return (this as any).defaults[key];
        }
        return (this as any).data[key];
    }

    set(key: any, val: any, dontWriteToFile?: any) {
        (this as any).data[key] = val;
        if (dontWriteToFile) return;
        try {
            fs.writeFileAsync((this as any).path, JSON.stringify((this as any).data));
        } catch (e) {
            fs.writeFileSync((this as any).path, JSON.stringify((this as any).data));
        }
    }
}

function parseDataFile(filePath: any, defaults: any) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaults;
    }
}

export const store = new Store(storeDefaults, userDataPath);
