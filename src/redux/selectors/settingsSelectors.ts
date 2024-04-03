import { TLists } from "../../helpers/Settings";
import { IStore } from "../store";
import Query from "/@/helpers/Query";

export function settingsSelector(store: IStore) {
    return store.settings;
}

export function getQueriesSelector(all?: boolean) {
    return (store: IStore) => {
        let queries = store.settings.queries.sort((a, b) => a.order - b.order);
        if (all) return queries;

        if (store.settings.lists.permawatch.length && !queries.some((x) => x.queryId === "___permawatch")) {
            const pwq = Query.getFakePermawatchQuery();
            queries = [...queries, pwq];
        }

        return queries.filter((q) => !!q.enabled);
    };
}

export function getProjectsSelector(all?: boolean) {
    return (store: IStore) => {
        const projects = store.settings.projects;
        if (all) return projects;

        return projects.filter((p) => p.enabled);
    };
}

export function getListsSelector(listName: TLists) {
    return (store: IStore) => {
        const lists = store.settings.lists;
        const list = lists[listName] || [];

        const sortedList = [...list].sort((a, b) => {
            if (listName !== "keywords") return a.id - b.id;
            else return 0;
        });

        return sortedList;
    };
}
