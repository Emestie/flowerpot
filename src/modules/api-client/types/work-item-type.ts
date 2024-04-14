interface Icon {
    id: string;
    url: string;
}

interface State {
    name: string;
    color: string;
    category: string;
}

export interface IWorkItemType {
    name: string;
    referenceName: string;
    description: string;
    color: string;
    icon: Icon;
    isDisabled: boolean;
    states: State[];
    url: string;
}
