import { WorkItem } from "../../models/work-item";
import { HighlightenText } from "../HighlightenText";
import { TableScale } from "/@/zustand/settings";
import { useSettingsStore } from "/@/zustand/settings";
import { s } from "/@/values/Strings";

export function Id({ item, hasChanges }: { item: WorkItem; hasChanges: boolean }) {
    const scale = useSettingsStore((state) => state.tableScale);

    return (
        <span title={item.type} style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
            {hasChanges && <span title={s("newItem")} className="HasChangesDot"></span>}
            {item.typeIconUrl && (
                <span
                    style={{
                        width: "1.1em",
                        height: scale === TableScale.Small ? "1.25em" : "1.2em",
                        marginRight: "0.4rem",
                    }}
                >
                    <img src={item.typeIconUrl} />
                </span>
            )}
            <HighlightenText text={item.id.toString()} />
        </span>
    );
}
