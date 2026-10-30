import { TLocale } from "../types";
import { useAppStore } from "../zustand/app";
import Platform from "./Platform";

/**
 * Info pages that ship in several languages as `<baseName>.<locale>.md` in
 * `public/info-pages`. Views keep asking for the language agnostic name
 * ("changelog.md"), the current locale picks the file.
 *
 * Adding a language means adding the file and the locale to the list below;
 * the declarations are verified against the shipped files in info-pages.test.ts.
 */
export const TRANSLATED_INFO_PAGES: Record<string, { baseName: string; locales: TLocale[] }> = {
    "changelog.md": { baseName: "changelog", locales: ["be", "en", "ru"] },
};

/** A missing translation must not leave the page empty. */
const FALLBACK_LOCALE: TLocale = "en";

export function resolveInfoPageName(pageName: string, locale: TLocale): string {
    const translated = TRANSLATED_INFO_PAGES[pageName];
    if (!translated) return pageName;

    const chosen = translated.locales.includes(locale) ? locale : FALLBACK_LOCALE;

    return `${translated.baseName}.${chosen}.md`;
}

export class Info {
    private static listenerDictionary: Record<string, () => void> = {
        "test1.md": () => {
            document.getElementById("testbutton")?.addEventListener("click", () => console.log("asdasd"));
            document.getElementById("testbutton2")?.addEventListener("click", () => {
                console.log("cd1");
                useAppStore.getState().setView("info", { contentFileName: "test2.md" });
            });
        },
        "test2.md": () => {
            document.getElementById("testbutton1")?.addEventListener("click", () => {
                console.log("cd2");
                useAppStore.getState().setView("info", { contentFileName: "test1.md" });
            });
        },
        "changelog.md": () => {
            document.getElementById("flowerpot-pwa-button")?.addEventListener("click", () => {
                Platform.current.openUrl("https://flowerpot-pwa.web.app");
            });
            document.getElementById("go-to-old-changelog")?.addEventListener("click", () => {
                useAppStore.getState().setView("info", { contentFileName: "changelog-old.md" });
            });
        },
        "changelog-old.md": () => {
            document.getElementById("go-to-new-changelog")?.addEventListener("click", () => {
                useAppStore.getState().setView("info", { contentFileName: "changelog.md" });
            });
        },
    };

    private static getFetchUrl(pageName: string) {
        return "./info-pages/" + pageName;
    }

    private static async fetchPage(pageName: string) {
        const url = this.getFetchUrl(resolveInfoPageName(pageName, useAppStore.getState().locale));

        return await fetch(url);
    }

    public static async getInfoText(pageName: string) {
        const page = await this.fetchPage(pageName);
        const text = await page.text();

        return text;
    }

    public static registerEventListeners(pageName: string) {
        const listeners = this.listenerDictionary[pageName];
        if (listeners) listeners();
    }
}
