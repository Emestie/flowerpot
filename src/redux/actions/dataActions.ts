import Differences from "../../helpers/Differences";
import Platform from "../../helpers/Platform";
import { IQuery } from "../../helpers/Query";
import { IWorkItem } from "../../helpers/WorkItem";
import { Actions } from "../actions-enum";
import { store } from "../store";
import { createAction } from "./_common";

export function dataChangesCollectionSet(changesCollection: any) {
    Platform.current.updateTrayIconDot(Differences.isChangesCollectionHasChanges(changesCollection));
    return createAction(Actions.DataChangesCollectionSet, { changesCollection });
}

export function dataChangesCollectionItemSet(workItem: IWorkItem, hasChanges: boolean) {
    const { changesCollection } = store.getState().data;

    changesCollection[workItem.id] = hasChanges ? true : undefined;

    localStorage.setItem("WIChangesCollection", JSON.stringify(changesCollection));

    Platform.current.updateTrayIconDot(Differences.isChangesCollectionHasChanges(changesCollection));
    return createAction(Actions.DataChangesCollectionItemSet, { changesCollection });
}

export function dataChangesCollectionClear() {
    localStorage.setItem("WIChangesCollection", JSON.stringify({}));

    Platform.current.updateTrayIconDot(false);
    return createAction(Actions.DataChangesCollectionClear, { changesCollection: {} });
}

export function dataWorkItemsForQuerySet(query: IQuery, items: IWorkItem[]) {
    const oldItems = store.getState().data.workItems.filter((wi) => wi._queryId !== query.queryId);
    return createAction(Actions.DataWorkItemsForQuerySet, { workItems: [...oldItems, ...items] });
}
