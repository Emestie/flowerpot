import store from "../store";
import Lists from "./Lists";
import { TLists } from "./Settings";
import { IQuery } from "./Query";

export interface IWorkItem {
    id: number;
    rev: number;
    type: string;
    iterationPath: string;
    areaPath: string;
    assignedTo: string;
    assignedToFull: string;
    assignedToImg: string;
    createdDate: string;
    freshness: string;
    createdBy: string;
    createdByFull: string;
    createdByImg: string;
    title: string;
    titleFull: string;
    promptness?: number;
    promptnessText?: string;
    importance?: number;
    importanceText?: string;
    rank?: number;
    weight: number;
    url: string;
    state: string;
    tags: string;
    _isMine: boolean;
    _list?: TLists;
    _isHasShelve: boolean;
    _isMoveToProd: boolean;
    _queryId: string;
    _collectionName: string;
}

export interface IResponseWorkItem {
    id: number;
    rev: number;
    url: string;
    fields: {
        "System.WorkItemType": string;
        "System.AssignedTo": any;
        "System.CreatedDate": string;
        "System.CreatedBy": any;
        "System.Title": string;
        "EOS.QA.PromptnessLevel"?: string;
        "EOS.QA.ImportanceLevel"?: string;
        "Microsoft.VSTS.Common.Rank"?: string;
        "System.IterationPath": string;
        "System.AreaPath": string;
        "Microsoft.VSTS.Common.Priority"?: string; //promptness
        "Microsoft.VSTS.Common.Severity"?: string; //importance
        "System.State": string;
        "System.History": string;
        "System.Tags": string;
    };
    _links: {
        html: {
            href: string;
        };
    };
}

export default class WorkItem {
    public static fish(queryfish: IQuery) {
        let fish = {
            id: 107715,
            rev: 7,
            fields: {
                "System.AreaPath": "QA\\Дело\\Web14",
                "System.TeamProject": "QA",
                "System.IterationPath": "QA\\Дело\\19.3",
                "System.WorkItemType": "Bug",
                "System.State": "Активный",
                "System.Reason": "Новый",
                "System.AssignedTo": "Мурашко Валерий Дмитриевич <MR\\valery.murashko>",
                "System.CreatedDate": "2019-09-06T12:34:59.6Z",
                "System.CreatedBy": "Громова Юлия Николаевна <EOSSOFT\\Cherry>",
                "System.ChangedDate": "2019-09-04T16:26:52.31Z",
                "System.ChangedBy": "TFSBuildAgent <EOS\\tfsbuildagent>",
                "System.Title":
                    "a.7 Ошибка при сохранении изменений в поручении после добавления нового пункта, если автор поручения должен добавиться в ЖПД",
                "Microsoft.VSTS.Common.Issue": "No",
                "Microsoft.VSTS.Common.StateChangeDate": "2019-08-16T12:34:59.6Z",
                "Microsoft.VSTS.Common.ActivatedDate": "2019-08-16T12:34:59.6Z",
                "Microsoft.VSTS.Common.ActivatedBy": "Громова Юлия Николаевна <EOSSOFT\\Cherry>",
                "Microsoft.VSTS.Build.IntegrationBuild": "Server_19.4/Server_19.4_20190904.10",
                "EOS.QA.PromptnessLevel": "3 - Среднесрочно",
                "EOS.QA.ImportanceLevel": "2 - Обычная",
                "EOS.QA.RequiredReason": "Модификация кода",
                "EOS.QA.Tester": "Громова Юлия Николаевна <EOSSOFT\\Cherry>",
                "System.Description":
                    '<p>В настройках пользователя на вкладке поручения высьавлен параметр Добавить в ЖПД автора</p>\n<p><img src="http://tfs:8080/tfs/DefaultCollection/WorkItemTracking/v1.0/AttachFileHandler.ashx?FileNameGUID=4eba9229-fbf8-4f4a-b3c4-b77d4274799b&amp;FileName=tmp3EBA.png" width=450><br></p>\n<p>Открыла РК. Ввела поручение (резолюцию или проект резолюции). Направила на исполнение. Взяла его же на редактирование. Добавила второй пункт. При сохранении ошибка:</p>\n<p><img src="http://tfs:8080/tfs/DefaultCollection/WorkItemTracking/v1.0/AttachFileHandler.ashx?FileNameGUID=bab51bca-51ce-4cb3-b2bf-03cb39ec578f&amp;FileName=tmpABEF.png" width=737><br></p>',
                "System.History": "The Fixed shelve In field was updated as part of associating work items with the build.",
                "System.Tags": "",
            },
            _links: {
                self: { href: "http://tfs.eos.loc:8080/tfs/DefaultCollection/_apis/wit/workItems/107715" },
                workItemUpdates: { href: "http://tfs.eos.loc:8080/tfs/DefaultCollection/_apis/wit/workItems/107715/updates" },
                workItemRevisions: { href: "http://tfs.eos.loc:8080/tfs/DefaultCollection/_apis/wit/workItems/107715/revisions" },
                workItemHistory: { href: "http://tfs.eos.loc:8080/tfs/DefaultCollection/_apis/wit/workItems/107715/history" },
                html: { href: "http://tfs:8080/tfs/web/wi.aspx?pcguid=4e3f53b6-9166-4ec9-bf6f-47ed01daa449&id=107715" },
                workItemType: {
                    href: "http://tfs.eos.loc:8080/tfs/DefaultCollection/dc1312ac-8ecb-48dd-9bdb-25c2d15e2375/_apis/wit/workItemTypes/Bug",
                },
                fields: { href: "http://tfs.eos.loc:8080/tfs/DefaultCollection/_apis/wit/fields" },
            },
            url: "http://tfs.eos.loc:8080/tfs/DefaultCollection/_apis/wit/workItems/107715",
        } as IResponseWorkItem;

        return this.buildFromResponse(fish, queryfish);
    }

    public static buildFromResponse(resp: IResponseWorkItem, query: IQuery) {
        let isMine =
            this.parseNameField(resp.fields["System.AssignedTo"] || "")
                .toLowerCase()
                .indexOf(store.settings.tfsUser.toLowerCase()) !== -1;
        let item: IWorkItem = {
            id: resp.id,
            rev: resp.rev,
            url: resp._links.html.href,
            type: resp.fields["System.WorkItemType"] || "",
            assignedTo: this.shortName(this.parseNameField(resp.fields["System.AssignedTo"]) || ""),
            assignedToFull: this.parseNameField(resp.fields["System.AssignedTo"] || ""),
            assignedToImg: resp.fields["System.AssignedTo"]?.imageUrl || "",
            createdDate: resp.fields["System.CreatedDate"],
            freshness: this.getTerm(resp.fields["System.CreatedDate"]),
            createdBy: this.shortName(this.parseNameField(resp.fields["System.CreatedBy"] || "")) || "",
            createdByFull: this.parseNameField(resp.fields["System.CreatedBy"] || ""),
            createdByImg: resp.fields["System.CreatedBy"]?.imageUrl || "",
            title: this.shortTitle(resp.fields["System.Title"]) || "",
            titleFull: resp.fields["System.Title"] || "",
            iterationPath: resp.fields["System.IterationPath"] || "",
            areaPath: resp.fields["System.AreaPath"] || "",
            promptness: this.extractLevel(resp.fields["EOS.QA.PromptnessLevel"] || resp.fields["Microsoft.VSTS.Common.Priority"]),
            promptnessText: resp.fields["EOS.QA.PromptnessLevel"] || resp.fields["Microsoft.VSTS.Common.Priority"] || "",
            importance: this.extractLevel(resp.fields["EOS.QA.ImportanceLevel"] || resp.fields["Microsoft.VSTS.Common.Severity"]),
            importanceText: resp.fields["EOS.QA.ImportanceLevel"] || resp.fields["Microsoft.VSTS.Common.Severity"] || "",
            rank: this.rankToNumber(resp.fields["Microsoft.VSTS.Common.Rank"]),
            weight: this.calcWeight(resp, isMine),
            state: resp.fields["System.State"] || "",
            tags: resp.fields["System.Tags"] || "",
            _isMine: isMine,
            _list: this.getListName(resp.id, query.collectionName),
            _isHasShelve: this.isHasShelve(resp.fields["System.History"]),
            _isMoveToProd: this.isMoveToProd(resp.fields["System.History"]),
            _queryId: query.queryId,
            _collectionName: query.collectionName,
        };
        return item;
    }

    private static parseNameField(nameField: any) {
        if (!nameField) return "";
        if (typeof nameField === "string") return nameField;

        return `${nameField.displayName} <${nameField.uniqueName}>`;
    }

    private static isHasShelve(text: string) {
        if (!text) return false;
        if (text.toLowerCase().indexOf("shelve") !== -1) return true;
        if (text.toLowerCase().indexOf("шелв") !== -1) return true;
        return false;
    }

    private static isMoveToProd(text: string) {
        if (!text) return false;
        if (text.toLowerCase().indexOf(" prod") !== -1) return true;
        if (text.toLowerCase().indexOf(" прод") !== -1) return true;
        if (text.toLowerCase().indexOf(" продакшен") !== -1) return true;
        if (text.toLowerCase().indexOf(" продакшн") !== -1) return true;
        if (text.toLowerCase().indexOf(" переносить") !== -1) return true;
        return false;
    }

    private static getListName(id: number, collectionName: string): TLists | undefined {
        if (Lists.isIn("deferred", collectionName, id)) return "deferred";
        if (Lists.isIn("favorites", collectionName, id)) return "favorites";
        if (Lists.isIn("pinned", collectionName, id)) return "pinned";
        if (Lists.isIn("hidden", collectionName, id)) return "hidden";
        if (Lists.isIn("permawatch", collectionName, id)) return "permawatch";

        return undefined;
    }

    private static calcWeight(resp: IResponseWorkItem, isMine: boolean) {
        let weight = 100;

        let promptness =
            this.extractLevel(resp.fields["EOS.QA.PromptnessLevel"]) || this.extractLevel(resp.fields["Microsoft.VSTS.Common.Priority"]) || 0;
        let importance =
            this.extractLevel(resp.fields["EOS.QA.ImportanceLevel"]) || this.extractLevel(resp.fields["Microsoft.VSTS.Common.Severity"]) || 0;

        if (promptness) {
            weight += promptness;
        } else {
            if (resp.fields["System.WorkItemType"] === "Issue") weight += 3;
        }

        if (importance) {
            weight += importance;
        }

        if (resp.fields["System.WorkItemType"] === "Task") {
            if (resp.fields["Microsoft.VSTS.Common.Rank"] === "1") weight += 1;
            else if (resp.fields["Microsoft.VSTS.Common.Rank"] === "2") weight += 2;
            else if (!resp.fields["Microsoft.VSTS.Common.Rank"]) weight += 4;
            else weight += 3;
        }

        return weight;
    }

    private static rankToNumber(rank?: string) {
        if (!rank) return undefined;
        return +rank || undefined;
    }

    private static extractLevel(level?: string): number | undefined {
        if (!level) return undefined;
        if (+level) return +level;
        return +level[0];
    }

    private static shortName(fullName: string): string {
        if (!fullName) return "";
        if (fullName.indexOf("TFSBuildAgent") !== -1) return "TFSBuildAgent";
        let [lname, fname, mname] = fullName.split(" ");
        let result = lname;
        if (fname) result += " " + fname[0] + ".";
        if (mname) result += " " + mname[0] + ".";
        return result;
    }

    private static shortTitle(title: string) {
        return title.substr(0, 70) + (title.length > 70 ? "..." : "");
    }

    private static getTerm(date: string) {
        if (!date) return "";
        let d = new Date(date);
        let now = new Date();

        let diff = now.getTime() - d.getTime();

        let _24h = 1000 * 60 * 60 * 24;
        if (diff < _24h) return Math.floor(diff / 1000 / 60 / 60) + "h";
        else return Math.floor(diff / 1000 / 60 / 60 / 24) + "d";
    }

    public static getTextName(fullName: string) {
        return fullName.split(" <")[0];
    }
}
