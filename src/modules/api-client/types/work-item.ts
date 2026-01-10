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
        "Custom.RequestNumber"?: string;
        "Custom.f21f0e34-49b2-4aac-b6a3-56ced21e1fcd"?: string;
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
