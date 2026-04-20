import { useAppStore } from "../zustand/app";
import { TLocale } from "../types";
import en from "./en";
import ru from "./ru";

export type LocalizedStrings = Record<keyof typeof en, string>;

export function s(string: keyof LocalizedStrings, locale?: TLocale): string {
    if (!locale) locale = useAppStore.getState().locale;
    if ((locale as any) === "auto") locale = "en";

    if (locale === "ru") return ru[string] || en[string] || "?-" + string;
    if (locale === "en") return en[string] || "?-" + string;
    return "[" + locale + "] " + string;
}
