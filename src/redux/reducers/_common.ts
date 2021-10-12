import { IAction, Reducers } from "../types";

export function updateState(reducer: Reducers, state: any, action: IAction) {
    const { type, payload } = action;

    if (!type.startsWith(reducer + "/")) return state;

    return { ...state, ...payload };
}
