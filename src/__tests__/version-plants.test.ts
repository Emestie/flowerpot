import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brandChangelogHeading, getMinorVersion, getReleasePlant, RELEASE_PLANTS } from "../helpers/VersionPlants";

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

describe("changelog heading branding", () => {
    const notes = "## 1.0.0\n\n- fixed settings loss\n\n## 0.8.15\n\n- older note\n";

    it("puts the plant after the version number", () => {
        expect(brandChangelogHeading(notes, "1.0.0", "Aglaonema")).toBe(
            "## 1.0.0 · Aglaonema\n\n- fixed settings loss\n\n## 0.8.15\n\n- older note\n"
        );
    });

    it("leaves the notes and the older releases untouched", () => {
        const branded = brandChangelogHeading(notes, "1.0.0", "Aglaonema");

        expect(branded).toContain("- fixed settings loss");
        expect(branded).toContain("## 0.8.15\n\n- older note");
    });

    it("changes nothing when the version has no heading", () => {
        expect(brandChangelogHeading(notes, "1.1.0", "Begonia")).toBe(notes);
        expect(brandChangelogHeading("_no notes yet_", "1.0.0", "Aglaonema")).toBe("_no notes yet_");
    });

    it("does not treat the version as a pattern", () => {
        expect(brandChangelogHeading("## 1x0y0\n", "1.0.0", "Aglaonema")).toBe("## 1x0y0\n");
    });
});
