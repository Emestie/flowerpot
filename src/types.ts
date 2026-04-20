export type TView =
    | "loading"
    | "error"
    | "main"
    | "settings"
    | "credentials"
    | "selectqueries"
    | "selectprojects"
    | "debug"
    | "refreshhelper"
    | "info";

export type TUpdateStatus = "none" | "downloading" | "ready" | "checking" | "error";

export type TLocale = "en" | "ru";

export type TDialog = "openById" | "feedback" | "addLink" | "exportSettings" | "importSettings";
