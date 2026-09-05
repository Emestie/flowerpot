import { IResponseWorkItem } from "../modules/api-client/types";
import { IWorkItemType } from "../modules/api-client/types/work-item-type";
import { Query } from "./query";
import { ItemsCommon } from "../helpers/ItemsCommon";
import Lists from "../helpers/Lists";
import { TLists } from "../helpers/Settings";
import { useSettingsStore } from "../zustand/settings";
import { s } from "../values/Strings";

//! do not use functions in WorkItem
export class WorkItem {
    id: number;
    rev: number;
    type: string;
    typeIconUrl: string | undefined;
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
    url: string;
    state: string;
    stateColor: string | undefined;
    states: IWorkItemType["states"] | undefined;
    tags: string;
    _isMine: boolean;
    _list?: TLists;
    _queryId: string;
    _collectionName: string;
    createdByTextName: string;
    assignedToTextName: string;
    priority: number | undefined;
    priorityText: string;
    isRed: boolean;
    requestNumber: string | undefined;

    constructor(resp: IResponseWorkItem, query: Query, workItemType: IWorkItemType | undefined) {
        const fields = resp.fields ?? ({} as IResponseWorkItem["fields"]);

        const isMine =
            fields["System.AssignedTo"]?.descriptor ===
            useSettingsStore.getState().accounts.find((x) => x.id === query.accountId)?.descriptor;

        const type = fields["System.WorkItemType"] || "";
        const createdByFull = ItemsCommon.parseNameField(fields["System.CreatedBy"] || "");
        const assignedToFull = ItemsCommon.parseNameField(fields["System.AssignedTo"] || "");
        const _list = getListName(query.accountId, resp.id, query.collectionName);

        const { priority, priorityText } = calculatePriority(resp);

        this.id = resp.id;
        this.rev = resp.rev;
        this.url = resp._links?.html?.href ?? "";
        this.type = type;
        this.typeIconUrl = workItemType?.icon.url;
        this.assignedTo = ItemsCommon.shortName(ItemsCommon.parseNameField(fields["System.AssignedTo"]) || "");
        this.assignedToFull = assignedToFull;
        this.assignedToImg = fields["System.AssignedTo"]?.imageUrl || "";
        this.createdDate = fields["System.CreatedDate"];
        this.freshness = ItemsCommon.getTerm(fields["System.CreatedDate"]);
        this.createdBy = ItemsCommon.shortName(ItemsCommon.parseNameField(fields["System.CreatedBy"] || "")) || "";
        this.createdByFull = createdByFull;
        this.createdByImg = fields["System.CreatedBy"]?.imageUrl || "";
        this.title = ItemsCommon.shortTitle(fields["System.Title"]) || "";
        this.titleFull = fields["System.Title"] || "";
        this.iterationPath = fields["System.IterationPath"] || "";
        this.areaPath = fields["System.AreaPath"] || "";
        this.state = fields["System.State"] || "";
        this.stateColor = workItemType?.states.find((state) => state.name === fields["System.State"])?.color;
        this.states = workItemType?.states;
        this.tags = fields["System.Tags"] || "";
        this._isMine = isMine;
        this._list = _list;
        this._queryId = query.queryId;
        this._collectionName = query.collectionName;
        this.createdByTextName = createdByFull.split(" <")[0];
        this.assignedToTextName = assignedToFull.split(" <")[0];
        this.priority = priority;
        this.priorityText = priorityText;
        this.isRed = priority === 1;
        this.requestNumber =
            fields["Custom.RequestNumber"] || fields["Custom.f21f0e34-49b2-4aac-b6a3-56ced21e1fcd"] || undefined;

        if (query.queryId.startsWith("___permawatch")) {
            const itemFromList = useSettingsStore
                .getState()
                .lists.permawatch.find((x) => x.id === this.id && x.accountId === query.accountId);
            this._collectionName = itemFromList?.collection || "";
        }
    }
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

function calculatePriority(resp: IResponseWorkItem): { priority: number | undefined; priorityText: string } {
    const fields = resp.fields ?? ({} as IResponseWorkItem["fields"]);

    const promptness = fields["EOS.QA.PromptnessLevel"] || fields["Microsoft.VSTS.Common.Priority"];
    const importance = fields["EOS.QA.ImportanceLevel"] || fields["Microsoft.VSTS.Common.Severity"];
    const rank = fields["Microsoft.VSTS.Common.Rank"];

    const priorityText = [
        promptness ? s("priority") + " " + promptness : undefined,
        importance ? s("severity") + " " + importance : undefined,
        rank ? "Rank " + rank : undefined,
    ]
        .filter((x) => !!x)
        .join(", ");

    const priority =
        extractLevel(fields["EOS.QA.PromptnessLevel"]) ??
        extractLevel(fields["Microsoft.VSTS.Common.Priority"]) ??
        extractLevel(fields["EOS.QA.ImportanceLevel"]) ??
        extractLevel(fields["Microsoft.VSTS.Common.Severity"]) ??
        rankToNumber(fields["Microsoft.VSTS.Common.Rank"]);

    return { priorityText, priority };
}

function getListName(accountId: string, id: number, collectionName: string): TLists | undefined {
    if (Lists.isIn(accountId, "deferred", collectionName, id)) return "deferred";
    if (Lists.isIn(accountId, "favorites", collectionName, id)) return "favorites";
    if (Lists.isIn(accountId, "pinned", collectionName, id)) return "pinned";
    if (Lists.isIn(accountId, "hidden", collectionName, id)) return "hidden";
    if (Lists.isIn(accountId, "permawatch", collectionName, id)) return "permawatch";
    if (Lists.isIn(accountId, "forwarded", collectionName, id)) return "forwarded";

    return undefined;
}
