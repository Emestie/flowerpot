import { WorkItem } from "../../models/work-item";
import { IAction, Reducers } from "../types";
import { updateState } from "./_common";

export interface IDataState {
    workItems: WorkItem[];
    changesCollection: any;
}

const initialState: IDataState = {
    workItems: [],
    changesCollection: {},
};

export function dataReducer(state = initialState, action: IAction) {
    return updateState(Reducers.Data, state, action);
}
