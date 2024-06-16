import { useSelector } from "react-redux";
import { HighlightenText } from "../HighlightenText";
import { IWorkItem } from "/@/modules/api-client";
import { IStore } from "/@/redux/store";

export function IterationPath({ item }: { item: IWorkItem }) {
    const [iterationPathA, iterationPathB] = createIterationPathParts(item.iterationPath);

    const themeNumber = useSelector((s: IStore) => s.settings.darkTheme) ? 1 : 0;
    const enableColors = useSelector((s: IStore) => s.settings.enableIterationColors);

    return (
        <span className="IterationInTitle" title={item.areaPath}>
            <HighlightenText text={iterationPathA} />
            {iterationPathB && (
                <>
                    <>\</>
                    <span
                        style={{
                            fontWeight: "bold",
                            color: enableColors ? colors[getColorNumber(iterationPathB)][themeNumber] : undefined,
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

function getColorNumber(text: string): number {
    const letters = text.split("");

    const charcodes = letters.map((x) => x.charCodeAt(0));

    const sum = charcodes.reduce((prev, next) => next + prev, 0);

    return sum % colors.length;
}

const colors = [
    ["#e5179e", "#e5179e"],
    ["#f08b24", "#f08b24"],
    ["#7209b7", "#b249f7"],
    ["#e75F64", "#e75F64"],
    ["#006466", "#309496"],
    ["#8A6426", "#aA8446"],
    ["#60ab8b", "#80cbab"],
    ["#e2aF32", "#ffe420"],
    ["#4865ff", "#5875ff"],
    ["#53c0d9", "#53c0d9"],
    ["#9Da373", "#ADC393"],
    ["#55a630", "#55a630"],
    ["#02BBFA", "#02BBFA"],
    ["#84b710", "#c4f750"],
];
