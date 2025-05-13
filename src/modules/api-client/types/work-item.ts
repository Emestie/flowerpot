import { TLists } from "/@/helpers/Settings";

//! do not use functions in IWorkItem
export interface IWorkItem {
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
    requestNumber: string | undefined
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
        "System.TeamProject": string;
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
        "Custom.RequestNumber"?: string 
    };
    _links: {
        workItemType: { href: string };
        html: { href: string };
    };
}

export interface IWorkItemShort {
    id: number;
    collection: string;
}
