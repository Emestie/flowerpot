import { useQuickSearchStore } from "../zustand/quick-search";

export function useHighlights() {
    const value = useQuickSearchStore((s) => s.value);

    return (value ?? "").split(";").filter((x) => !!x.trim());
}
