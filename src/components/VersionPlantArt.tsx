import Version from "../helpers/Version";

/**
 * The banner art of the plant that brands the running release. Renders
 * nothing for versions the plant map does not cover, so callers do not have
 * to guard for it themselves.
 */
export function VersionPlantArt(props: { className?: string }) {
    const plant = Version.plant;

    if (!plant) return null;

    return <img className={props.className} src={plant.art} alt={plant.name} />;
}
