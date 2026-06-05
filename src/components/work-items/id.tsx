import { WorkItem } from "../../models/work-item";
import { HighlightenText } from "../HighlightenText";
import { TableScale } from "/@/zustand/settings";
import { useSettingsStore } from "/@/zustand/settings";
import { s } from "/@/values/Strings";

export function Id({ item, hasChanges }: { item: WorkItem; hasChanges: boolean }) {
    const scale = useSettingsStore((state) => state.tableScale);

    return (
        <span title={item.type} className="flex-start">
            {hasChanges && <span title={s("newItem")} className="HasChangesDot"></span>}
            {item.typeIconUrl && (
                <span className={`id-icon-wrap ${scale === TableScale.Small ? "id-icon-wrap-sm" : "id-icon-wrap-md"}`}>
                    <img src={item.typeIconUrl} />
                </span>
            )}
            <HighlightenText text={item.id.toString()} />
        </span>
    );
}
