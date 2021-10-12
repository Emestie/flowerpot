import { IWorkItem } from "../../helpers/WorkItem";
import { Actions } from "../actions-enum";
import { store } from "../store";
import { createAction } from "./_common";

export function dataChangesCollectionSet(changesCollection: any) {
    return createAction(Actions.DataChangesCollectionSet, { changesCollection });
}

export function dataChangesCollectionItemSet(workItem: IWorkItem, hasChanges: boolean) {
    const { changesCollection } = store.getState().data;

    changesCollection[workItem.id] = hasChanges ? true : undefined;

    localStorage.setItem("WIChangesCollection", JSON.stringify(changesCollection));

    return createAction(Actions.DataChangesCollectionItemSet, { changesCollection });
}

export function dataChangesCollectionClear() {
    return createAction(Actions.DataChangesCollectionClear, { changesCollection: {} });
}
