import { IQuery, IResponseWorkItem, IWorkItem } from "../types";
import { ItemsCommon } from "/@/helpers/ItemsCommon";
import Lists from "/@/helpers/Lists";
import { TLists } from "/@/helpers/Settings";
import { store } from "/@/redux/store";

export function buildWorkItem(resp: IResponseWorkItem, query: IQuery): IWorkItem {
    const isMine =
        ItemsCommon.parseNameField(resp.fields["System.AssignedTo"] || "")
            .toLowerCase()
            .indexOf(store.getState().settings.tfsUser.toLowerCase()) !== -1;

    const item: IWorkItem = {
        id: resp.id,
        rev: resp.rev,
        url: resp._links.html.href,
        type: resp.fields["System.WorkItemType"] || "",
        assignedTo: ItemsCommon.shortName(ItemsCommon.parseNameField(resp.fields["System.AssignedTo"]) || ""),
        assignedToFull: ItemsCommon.parseNameField(resp.fields["System.AssignedTo"] || ""),
        assignedToImg: resp.fields["System.AssignedTo"]?.imageUrl || "",
        createdDate: resp.fields["System.CreatedDate"],
        freshness: ItemsCommon.getTerm(resp.fields["System.CreatedDate"]),
        createdBy: ItemsCommon.shortName(ItemsCommon.parseNameField(resp.fields["System.CreatedBy"] || "")) || "",
        createdByFull: ItemsCommon.parseNameField(resp.fields["System.CreatedBy"] || ""),
        createdByImg: resp.fields["System.CreatedBy"]?.imageUrl || "",
        title: ItemsCommon.shortTitle(resp.fields["System.Title"]) || "",
        titleFull: resp.fields["System.Title"] || "",
        iterationPath: resp.fields["System.IterationPath"] || "",
        areaPath: resp.fields["System.AreaPath"] || "",
        promptness: extractLevel(
            resp.fields["EOS.QA.PromptnessLevel"] || resp.fields["Microsoft.VSTS.Common.Priority"]
        ),
        promptnessText: resp.fields["EOS.QA.PromptnessLevel"] || resp.fields["Microsoft.VSTS.Common.Priority"] || "",
        importance: extractLevel(
            resp.fields["EOS.QA.ImportanceLevel"] || resp.fields["Microsoft.VSTS.Common.Severity"]
        ),
        importanceText: resp.fields["EOS.QA.ImportanceLevel"] || resp.fields["Microsoft.VSTS.Common.Severity"] || "",
        rank: rankToNumber(resp.fields["Microsoft.VSTS.Common.Rank"]),
        weight: calcWeight(resp),
        state: resp.fields["System.State"] || "",
        tags: resp.fields["System.Tags"] || "",
        _isMine: isMine,
        _list: getListName(resp.id, query.collectionName),
        _isHasShelve: isHasShelve(resp.fields["System.History"]),
        _moveToProdMessage: getMoveToProdMessage(resp.fields["System.History"]),
        _queryId: query.queryId,
        _collectionName: query.collectionName,
        _filteredBy: {},
    };

    return item;
}

function rankToNumber(rank?: string) {
    if (!rank) return undefined;
    return +rank || undefined;
}

function extractLevel(level?: string): number | undefined {
    if (!level) return undefined;
    if (+level) return +level;
    return +level[0];
}

function calcWeight(resp: IResponseWorkItem) {
    let weight = 100;

    const promptness =
        extractLevel(resp.fields["EOS.QA.PromptnessLevel"]) ||
        extractLevel(resp.fields["Microsoft.VSTS.Common.Priority"]) ||
        0;
    const importance =
        extractLevel(resp.fields["EOS.QA.ImportanceLevel"]) ||
        extractLevel(resp.fields["Microsoft.VSTS.Common.Severity"]) ||
        0;

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

function getListName(id: number, collectionName: string): TLists | undefined {
    if (Lists.isIn("deferred", collectionName, id)) return "deferred";
    if (Lists.isIn("favorites", collectionName, id)) return "favorites";
    if (Lists.isIn("pinned", collectionName, id)) return "pinned";
    if (Lists.isIn("hidden", collectionName, id)) return "hidden";
    if (Lists.isIn("permawatch", collectionName, id)) return "permawatch";
    if (Lists.isIn("forwarded", collectionName, id)) return "forwarded";

    return undefined;
}

function isHasShelve(text: string) {
    if (!text) return false;
    if (text.toLowerCase().indexOf("shelve") !== -1) return true;
    if (text.toLowerCase().indexOf("шелв") !== -1) return true;
    return false;
}

//TODO: remove this? questionable functionality
function getMoveToProdMessage(text: string) {
    if (!text) return null;
    if (text.toLowerCase().indexOf(" prod") !== -1) return text;
    if (text.toLowerCase().indexOf(" прод") !== -1) return text;
    if (text.toLowerCase().indexOf(" продакшен") !== -1) return text;
    if (text.toLowerCase().indexOf(" продакшн") !== -1) return text;
    if (text.toLowerCase().indexOf(" переносить") !== -1) return text;
    return null;
}
