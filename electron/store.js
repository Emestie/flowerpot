const path = require("path");
const fs = require("fs");

class Store {
    constructor(opts, userDataPath) {
        this.path = path.join(userDataPath, opts.configName + ".json");
        this.defaults = opts.defaults;
        this.data = parseDataFile(this.path, opts.defaults);

        if (!this.data.installationID) {
            let iid = "";

            for (let i = 0; i < 6; i++) {
                if (i < 3) iid += String.fromCharCode(Math.random() * 26 + 65);
                else iid += String.fromCharCode(Math.random() * 10 + 48);
            }

            this.set("installationID", "FLW-" + iid);
        }
    }

    get(key) {
        if (this.data[key] === undefined) {
            return this.defaults[key];
        }
        return this.data[key];
    }

    set(key, val, dontWriteToFile) {
        this.data[key] = val;
        if (dontWriteToFile) return;
        try {
            fs.writeFileAsync(this.path, JSON.stringify(this.data));
        } catch (e) {
            fs.writeFileSync(this.path, JSON.stringify(this.data));
        }
    }
}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaults;
    }
}

module.exports = Store;
