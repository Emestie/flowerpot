import { Actions } from "../actions-enum";
import { IAction } from "../types";

export function createAction<T = any>(type: Actions, payload?: T): IAction<T> {
    return { type, payload };
}
