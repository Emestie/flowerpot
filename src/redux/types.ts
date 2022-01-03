export interface IAction<T = any> {
    type: string;
    payload?: T;
}

export type TView =
    | "loading"
    | "error"
    | "main"
    | "settings"
    | "credentials"
    | "selectqueries"
    | "debug"
    | "lists"
    | "refreshhelper"
    | "info";

export type TUpdateStatus = "none" | "downloading" | "ready" | "checking" | "error";

export type TLocale = "en" | "ru";

export type TDialog = "openById" | "feedback" | "addLink";

export enum Reducers {
    App = "app",
    Data = "data",
    Settings = "settings",
}
