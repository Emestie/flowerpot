import { useSelector } from "react-redux";
import { HighlightenText } from "../HighlightenText";
import { IWorkItem } from "/@/modules/api-client";
import { iterationPalette } from "/@/modules/palette";
import { IStore } from "/@/redux/store";

export function IterationPath({ item }: { item: IWorkItem }) {
    const [iterationPathA, iterationPathB] = createIterationPathParts(item.iterationPath);

    const enableColors = useSelector((s: IStore) => s.settings.enableIterationColors);

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
