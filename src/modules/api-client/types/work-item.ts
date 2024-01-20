import { TLists } from "/@/helpers/Settings";

//! do not use functions in IWorkItem
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
    _moveToProdMessage: string | null;
    _queryId: string;
    _collectionName: string;
    _filteredBy: Record<string, string | undefined>;
    createdByTextName: string;
    assignedToTextName: string;
    isOrange: boolean;
    isRed: boolean;
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

export interface IWorkItemShort {
    id: number;
    collection: string;
}
