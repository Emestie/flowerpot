import en from "./en";
import ru from "./ru";
import store, { TLocale } from "../store-mbx";

export interface ILocalizedStrings {
    [s: string]: string;
}

export function s(string: string, locale?: TLocale): string {
    //en locale is default one

    if (!locale) locale = store.locale;
    if ((locale as any) === "auto") locale = "en";

    if (locale === "ru") return ru[string] || en[string] || "?-" + string;
    if (locale === "en") return en[string] || "?-" + string;
    return "[" + locale + "] " + string;
}
