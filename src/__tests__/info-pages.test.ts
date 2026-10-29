import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveInfoPageName, TRANSLATED_INFO_PAGES } from "../helpers/Info";

describe("info page translations", () => {
    it("picks the changelog of the interface language", () => {
        expect(resolveInfoPageName("changelog.md", "ru")).toBe("changelog.ru.md");
        expect(resolveInfoPageName("changelog.md", "be")).toBe("changelog.be.md");
        expect(resolveInfoPageName("changelog.md", "en")).toBe("changelog.en.md");
    });

    it("falls back to english when the language has no translation", () => {
        expect(resolveInfoPageName("changelog.md", "de" as any)).toBe("changelog.en.md");
    });

    it("keeps single language pages as they are", () => {
        expect(resolveInfoPageName("changelog-old.md", "en")).toBe("changelog-old.md");
        expect(resolveInfoPageName("test1.md", "ru")).toBe("test1.md");
    });

    it("ships the file of every declared language", () => {
        for (const [pageName, { baseName, locales }] of Object.entries(TRANSLATED_INFO_PAGES)) {
            expect(resolveInfoPageName(pageName, "en")).toBe(`${baseName}.en.md`);

            for (const locale of locales) {
                const path = join(process.cwd(), "public", "info-pages", `${baseName}.${locale}.md`);
                expect(existsSync(path), `${baseName}.${locale}.md is missing`).toBe(true);
            }
        }
    });
});
