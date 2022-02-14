export namespace ItemsCommon {
    export function parseNameField(nameField: any) {
        if (!nameField) return "";
        if (typeof nameField === "string") return nameField;

        return `${nameField.displayName} <${nameField.uniqueName}>`;
    }

    export function shortName(fullName: string): string {
        if (!fullName) return "";
        if (fullName.indexOf("TFSBuildAgent") !== -1) return "TFSBuildAgent";
        const [fullNameNoUid] = fullName.split(" <");
        let [lname, fname, mname] = fullNameNoUid.split(" ");
        let result = lname;
        if (fname) result += " " + fname[0] + ".";
        if (mname) result += " " + mname[0] + ".";
        return result;
    }

    export function shortTitle(title: string) {
        return title.substr(0, 70) + (title.length > 70 ? "..." : "");
    }

    export function getTerm(date: string) {
        if (!date) return "";
        let d = new Date(date);
        let now = new Date();

        let diff = now.getTime() - d.getTime();

        let _24h = 1000 * 60 * 60 * 24;
        let _60d = 1000 * 60 * 60 * 24 * 60;
        if (diff < _24h) return Math.floor(diff / 1000 / 60 / 60) + "h";
        else if (diff < _60d) return Math.floor(diff / 1000 / 60 / 60 / 24) + "d";
        else return Math.floor(diff / 1000 / 60 / 60 / 24 / 30) + "mo";
    }
}
