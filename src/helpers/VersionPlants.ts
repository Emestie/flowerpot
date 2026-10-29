/**
 * Release branding: every minor release of Flowerpot is named after a plant.
 *
 * The map is keyed by `<major>.<minor>` on purpose: a patch release (1.0.3)
 * keeps the plant of its minor release, so bug-fix releases never rename a
 * version. Versions that are not listed here (0.8.x and older, unreleased
 * builds) have no branding at all — the UI must render nothing for them.
 *
 * Plant names are not translated, they are the same in every locale. The art
 * of a plant is `public/version-plants/<name in lower case>.svg`, addressed
 * relative to index.html because the build uses `base: ""`.
 */
export const RELEASE_PLANTS: Record<string, string> = {
    "1.0": "Aglaonema",
};

export interface IReleasePlant {
    /** Name as it is shown in the UI. */
    name: string;
    /** Url of the banner art, relative to index.html. */
    art: string;
}

/** `1.0.0` -> `1.0`; anything without a major.minor pair -> `""`. */
export function getMinorVersion(version: string): string {
    const match = /^(\d+)\.(\d+)/.exec(version.trim());

    return match ? `${match[1]}.${match[2]}` : "";
}

/** The plant of a version, or undefined when that release has no branding. */
export function getReleasePlant(version: string): IReleasePlant | undefined {
    const name = RELEASE_PLANTS[getMinorVersion(version)];

    if (!name) return undefined;

    return { name, art: `./version-plants/${name.toLowerCase().replace(/\s+/g, "-")}.svg` };
}

/**
 * Puts the plant right after the version number of the changelog heading,
 * `## 1.0.0` -> `## 1.0.0 · Aglaonema`. Only the heading of the version being
 * shown is touched: the notes below it and the older releases stay as they are.
 */
export function brandChangelogHeading(markdown: string, version: string, plant: string): string {
    const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const heading = new RegExp(`^(#{1,6}[ \\t]+${escapedVersion})[ \\t]*$`, "m");

    return markdown.replace(heading, `$1 · ${plant}`);
}
