import { WorkItem } from "../../models/work-item";
import { HighlightenText } from "../HighlightenText";
import { s } from "/@/values/Strings";

interface Props {
    workItem: WorkItem;
}

export function Status({ workItem }: Props) {
    const text = workItem.state;

    return (
        <div className="wiStatus" title={s("wiStatus") + text}>
            <span className="wiStatusDot" style={{ backgroundColor: "#" + workItem.stateColor }} />
            <span className="wiStatusText">
                <HighlightenText text={shrink(text)} />
            </span>
        </div>
    );
}

function shrink(text: string): string {
    const BASE_LIMIT = 11;

    if (text.length <= BASE_LIMIT) return text;

    const words = text.split(" ");

    if (words.length > 1) return words.map((x) => x.at(0)?.toUpperCase()).join("");

    return words.at(0)?.slice(0, BASE_LIMIT) + ".";
}
