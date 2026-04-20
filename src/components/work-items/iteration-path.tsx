import { WorkItem } from "../../models/work-item";
import { HighlightenText } from "../HighlightenText";
import { iterationPalette } from "/@/modules/palette";
import { useSettingsStore } from "/@/zustand/settings";

export function IterationPath({ item }: { item: WorkItem }) {
    const [iterationPathA, iterationPathB] = createIterationPathParts(item.iterationPath);

    const enableColors = useSettingsStore((state) => state.enableIterationColors);

    return (
        <span className="IterationInTitle" title={item.areaPath}>
            <HighlightenText text={iterationPathA} />
            {iterationPathB && (
                <>
                    {iterationPathA && <>\</>}
                    <span
                        style={{
                            fontWeight: "bold",
                            color: enableColors ? iterationPalette.getColor(iterationPathB).hex : undefined,
                        }}
                    >
                        <HighlightenText text={iterationPathB} />
                    </span>
                </>
            )}
        </span>
    );
}

function createIterationPathParts(iterationPath: string) {
    const [last, ...rest] = iterationPath.split("\\").reverse();

    return [rest.reverse().join("\\"), last];
}
