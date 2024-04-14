import { IWorkItem } from "/@/modules/api-client";
import { s } from "/@/values/Strings";

interface Props {
    workItem: IWorkItem;
}

export function Status({ workItem }: Props) {
    const text = workItem.state;

    return (
        <div className="wiStatus" title={s("wiStatus") + text}>
            <span className="wiStatusDot" style={{ backgroundColor: "#" + workItem.stateColor }} />
            <span className="wiStatusText">{shrink(text)}</span>
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
