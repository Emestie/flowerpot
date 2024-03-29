import { store } from "../redux/store";
import { TLocale } from "../redux/types";
import en from "./en";
import ru from "./ru";

export type LocalizedStrings = Record<keyof typeof en, string>;

export function s(string: keyof LocalizedStrings, locale?: TLocale): string {
    //en locale is default one

    if (!locale) locale = store.getState().app.locale;
    if ((locale as any) === "auto") locale = "en";

    if (locale === "ru") return ru[string] || en[string] || "?-" + string;
    if (locale === "en") return en[string] || "?-" + string;
    return "[" + locale + "] " + string;
}
