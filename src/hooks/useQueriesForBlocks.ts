import { Query } from "../models/query";
import { useSettingsStore } from "../zustand/settings";
import QueryHelper from "../helpers/Query";

export const queriesSorting = (a: Query, b: Query) => {
    if (a.empty === b.empty) return 0;
    if (!a.empty && b.empty) return -1;
    else return 1;
};

export function useQueriesForBlocks() {
    let queries = useSettingsStore((state) => state.queries.sort((a, b) => a.order - b.order));
    const lists = useSettingsStore((state) => state.lists);
    const accounts = useSettingsStore((state) => state.accounts);
    if (lists.permawatch.length && !queries.some((x) => x.queryId.startsWith("___permawatch"))) {
        const pwq = accounts
            .filter((acc) => lists.permawatch.some((x) => x.accountId === acc.id))
            .map((acc) => QueryHelper.getFakePermawatchQuery(acc.id));
        queries = [...queries, ...pwq];
    }

    return queries.filter((q) => !!q.enabled).sort(queriesSorting);
}