import { useMemo } from "react";
import { Query } from "../../models/query";
import { WorkItem } from "../../models/work-item";
import { useHighlights } from "/@/hooks/useHighlights";
import { useDataStore } from "/@/zustand/data";

export function useFilteredWorkItems(query: Query) {
    const workItems = useDataStore((state) => state.workItems);

    const allItems = useMemo(() => workItems.filter((wi) => wi._queryId === query.queryId), [workItems, query.queryId]);

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
