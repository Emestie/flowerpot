import { IAction, Reducers } from "../types";
import { updateState } from "./_common";
import { IWorkItem } from "/@/modules/api-client";

export interface IDataState {
    workItems: IWorkItem[];
    changesCollection: any;
}

const initialState: IDataState = {
    workItems: [],
    changesCollection: {},
};

export function dataReducer(state = initialState, action: IAction) {
    return updateState(Reducers.Data, state, action);
}
