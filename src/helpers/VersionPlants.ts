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
 * One block of the changelog page: a run of consecutive releases that share a
 * plant, plus the art that heads it.
 */
export interface IChangelogGroup {
    /** Plant branding the releases of this run, undefined for releases that have none. */
    plant?: IReleasePlant;
    /**
     * Markdown of the run, ready to render. The plant name sits on the release
     * that introduced it — the oldest one of the run — and the newer releases of
     * the same plant stay plain, so a patch release never repeats the name.
     */
    markdown: string;
}

interface IChangelogBlock {
    version?: string;
    lines: string[];
}

/** `## 1.0.0` — a release heading of the changelog. */
const RELEASE_HEADING = /^(#{1,6}[ \t]+)(\d+\.\d+\.\d+[^\s]*)[ \t]*$/;

/**
 * Splits a changelog into the runs that share a plant, so the view can put the
 * plant art above each run and the plant name on the release that introduced it:
 *
 *     [Aglaonema art]        [Begonia art]
 *     ## 1.1.1               ## 1.1.0 · Begonia
 *     ## 1.0.1               ## 1.0.0 · Aglaonema
 *
 * Names come from `RELEASE_PLANTS`, so they survive later releases and appear in
 * the archived changelog as well. Releases the map does not cover share a run of
 * their own and are rendered without art or name.
 */
export function groupChangelogByPlant(
    markdown: string,
    resolvePlant: (version: string) => IReleasePlant | undefined = getReleasePlant
): IChangelogGroup[] {
    const blocks: IChangelogBlock[] = [{ lines: [] }];

    // the shipped pages use CRLF; normalise so a heading never ends with a stray \r
    for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
        const heading = RELEASE_HEADING.exec(line);

        if (heading) blocks.push({ version: heading[2], lines: [line] });
        else blocks[blocks.length - 1].lines.push(line);
    }

    const runs: { plant?: IReleasePlant; blocks: IChangelogBlock[] }[] = [];

    for (const block of blocks) {
        const plant = block.version ? resolvePlant(block.version) : undefined;
        const run = runs[runs.length - 1];

        if (run && run.plant?.name === plant?.name) run.blocks.push(block);
        else runs.push({ plant, blocks: [block] });
    }

    return runs
        .map((run) => {
            if (run.plant) {
                const introduced = [...run.blocks].reverse().find((block) => block.version);

                if (introduced) {
                    introduced.lines[0] = introduced.lines[0].replace(RELEASE_HEADING, `$1$2 · ${run.plant.name}`);
                }
            }

            return {
                plant: run.plant,
                markdown: run.blocks.flatMap((block) => block.lines).join("\n"),
            } as IChangelogGroup;
        })
        .filter((group) => group.markdown.trim() !== "");
}
