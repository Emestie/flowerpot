import { useSelector } from "react-redux";
import { useHighlights } from "/@/hooks/useHighlights";
import { IQuery } from "/@/modules/api-client";
import { getWorkItemsForQuerySelector } from "/@/redux/selectors/dataSelectors";

export function useFilteredWorkItems(query: IQuery) {
    const allItems = useSelector(getWorkItemsForQuerySelector(query));

    const highlights = useHighlights();

    if (!highlights.length) {
        return allItems;
    }

    const prepare = (s: string | null | undefined): string => (s ?? "").toLowerCase();
    const indexOf = (s: string) => highlights.some((x) => s.includes(x));

    const filtered = allItems.filter((item) => {
        const itf = indexOf(prepare(item.titleFull));
        const iid = indexOf(prepare(item.id.toString()));
        const iatf = indexOf(prepare(item.assignedToFull));
        const icbf = indexOf(prepare(item.createdByFull));
        const iitp = indexOf(prepare(item.iterationPath));
        const is = indexOf(prepare(item.state));
        const it = indexOf(prepare(item.tags));

        if (highlights.length && (itf || iid || iatf || icbf || iitp || is || it)) {
            return true;
        }

        return false;
    });

    return filtered;
}
