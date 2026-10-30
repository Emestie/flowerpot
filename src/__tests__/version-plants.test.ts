import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    getMinorVersion,
    getReleasePlant,
    groupChangelogByPlant,
    IReleasePlant,
    RELEASE_PLANTS,
} from "../helpers/VersionPlants";

describe("release plants", () => {
    it("names a release after its plant", () => {
        expect(getReleasePlant("1.0.0")).toEqual({ name: "Aglaonema", art: "./version-plants/aglaonema.svg" });
        expect(getReleasePlant("1.0")).toEqual({ name: "Aglaonema", art: "./version-plants/aglaonema.svg" });
    });

    it("keeps the name of the minor release across patches", () => {
        expect(getReleasePlant("1.0.1")?.name).toBe("Aglaonema");
        expect(getReleasePlant("1.0.15")?.name).toBe("Aglaonema");
    });

    it("has no plant for versions the map does not cover", () => {
        expect(getReleasePlant("1.1.0")).toBeUndefined();
        expect(getReleasePlant("0.8.15")).toBeUndefined();
        expect(getReleasePlant("2.0.0")).toBeUndefined();
        expect(getReleasePlant("")).toBeUndefined();
        expect(getReleasePlant("garbage")).toBeUndefined();
    });

    it("reads the minor version out of any version string", () => {
        expect(getMinorVersion("1.0.0")).toBe("1.0");
        expect(getMinorVersion("1.0.0+7")).toBe("1.0");
        expect(getMinorVersion("12.34.56")).toBe("12.34");
        expect(getMinorVersion("")).toBe("");
    });

    it("ships the art every mapped plant points at", () => {
        for (const [minor, name] of Object.entries(RELEASE_PLANTS)) {
            const path = join(process.cwd(), "public", "version-plants", `${name.toLowerCase()}.svg`);

            expect(getReleasePlant(`${minor}.0`)?.name).toBe(name);
            expect(existsSync(path), `${name}.svg is missing`).toBe(true);
        }
    });
});

describe("changelog grouping by plant", () => {
    /** A changelog of two plants plus a release from before the naming started. */
    const changelog = [
        "## 1.1.1",
        "",
        "- begonia patch",
        "",
        "## 1.1.0",
        "",
        "- begonia",
        "",
        "## 1.0.1",
        "",
        "- aglaonema patch",
        "",
        "## 1.0.0",
        "",
        "- aglaonema",
        "",
        "## 0.8.15",
        "",
        "- old release",
        "",
    ].join("\n");

    const begonia: IReleasePlant = { name: "Begonia", art: "./version-plants/begonia.svg" };

    // stands in for the map of a future release, where 1.1 is Begonia
    const resolvePlant = (version: string) => (version.startsWith("1.1.") ? begonia : getReleasePlant(version));

    it("puts the art above every run and the name on the release that started it", () => {
        const groups = groupChangelogByPlant(changelog, resolvePlant);

        expect(groups.map((group) => group.plant?.name)).toEqual(["Begonia", "Aglaonema", undefined]);
        expect(groups[0].markdown).toContain("## 1.1.1\n");
        expect(groups[0].markdown).toContain("## 1.1.0 · Begonia\n");
        expect(groups[1].markdown).toContain("## 1.0.1\n");
        expect(groups[1].markdown).toContain("## 1.0.0 · Aglaonema\n");
    });

    it("leaves releases without a plant unbranded", () => {
        const groups = groupChangelogByPlant(changelog, resolvePlant);

        expect(groups[2].plant).toBeUndefined();
        expect(groups[2].markdown).toBe("## 0.8.15\n\n- old release\n");
    });

    it("keeps the notes of every release with its heading", () => {
        const groups = groupChangelogByPlant(changelog, resolvePlant);

        expect(groups[1].markdown).toBe("## 1.0.1\n\n- aglaonema patch\n\n## 1.0.0 · Aglaonema\n\n- aglaonema\n");
    });

    it("names a single release group and puts the art above it", () => {
        const groups = groupChangelogByPlant("## 1.0.0\n\n- first release of the name\n", resolvePlant);

        expect(groups).toHaveLength(1);
        expect(groups[0].plant?.name).toBe("Aglaonema");
        expect(groups[0].markdown).toBe("## 1.0.0 · Aglaonema\n\n- first release of the name\n");
    });

    it("reads headings of a CRLF page like the shipped ones", () => {
        const groups = groupChangelogByPlant("## 1.0.0\r\n\r\n- note\r\n", resolvePlant);

        expect(groups).toHaveLength(1);
        expect(groups[0].plant?.name).toBe("Aglaonema");
        expect(groups[0].markdown).toBe("## 1.0.0 · Aglaonema\n\n- note\n");
    });

    it("keeps a page without release headings in one unbranded group", () => {
        const page = "_Release notes are not available in English for now_\n";
        const groups = groupChangelogByPlant(page, resolvePlant);

        expect(groups).toEqual([{ plant: undefined, markdown: page }]);
    });

    it("drops the empty block before the first heading", () => {
        const groups = groupChangelogByPlant(changelog, resolvePlant);

        expect(groups[0].markdown.startsWith("## 1.1.1")).toBe(true);
    });
});
