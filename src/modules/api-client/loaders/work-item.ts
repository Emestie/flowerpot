import { Loader } from "../loader";
import { buildWorkItem } from "../models";
import { IQuery, IQueryResult, IResponseWorkItem, IValue, IWorkItem, IWorkItemShort } from "../types";
import Differences from "/@/helpers/Differences";
import Lists from "/@/helpers/Lists";
import { getListsSelector } from "/@/redux/selectors/settingsSelectors";
import { store } from "/@/redux/store";

export function createWorkItemLoaders(loader: Loader) {
    return {
        async getByQuery(query: IQuery): Promise<IWorkItem[]> {
            const queryResult =
                query.queryId === "___permawatch"
                    ? null
                    : await loader<IQueryResult>(
                          query.collectionName +
                              "/" +
                              query.teamId +
                              "/_apis/wit/wiql/" +
                              query.queryId +
                              "?api-version=5.1",
                      );

            const workItemsShort = getWorkItemsByQueryType(queryResult, query);

            const workItemsAll = await this.getList(workItemsShort, query);

            const workItemsFiltered = workItemsAll
                .filter((x) => x !== null)
                .filter((x) => x?._list !== "hidden") as IWorkItem[];

            Differences.put(query, workItemsFiltered);

            return workItemsFiltered;
        },
        async getOne({ id, collection }: IWorkItemShort, query: IQuery): Promise<IWorkItem | null> {
            const workItemResponse = await loader<IResponseWorkItem>(
                collection + "/_apis/wit/workItems/" + id + "?api-version=5.1",
            );

            if (!workItemResponse.id) {
                Lists.deleteFromList("permawatch", id, collection);
                return null;
            }

            return buildWorkItem(workItemResponse, query);
        },
        async getList(list: IWorkItemShort[], query: IQuery): Promise<IWorkItem[]> {
            const collections = list.map((x) => x.collection).filter((i, v, a) => a.indexOf(i) === v);

            const workItemResponses = await Promise.all(
                collections.map((collection) =>
                    loader<IValue<IResponseWorkItem[]>>(collection + "/_apis/wit/workitemsbatch?api-version=5.1", {
                        method: "POST",
                        body: JSON.stringify({
                            ids: list.filter((l) => l.collection === collection).map((l) => l.id),
                            $expand: "links",
                        }),
                    }),
                ),
            );

            return workItemResponses.flatMap((x) => x.value).map((wir) => buildWorkItem(wir, query));
        },
    };
}

function getWorkItemsByQueryType(queryResult: IQueryResult | null, query: IQuery): IWorkItemShort[] {
    if (queryResult === null) {
        return query.queryId === "___permawatch"
            ? getListsSelector("permawatch")(store.getState()).map((x) => ({
                  id: x.id,
                  collection: x.collection || "",
              }))
            : [];
    }

    if (queryResult.queryType === "flat")
        return queryResult.workItems.map((wi) => ({ id: wi.id, collection: query.collectionName }));

    if (queryResult.workItemRelations) {
        return queryResult.workItemRelations
            .map((wir) => wir.target)
            .filter((x) => !!x)
            .map((x) => ({ id: x.id, collection: query.collectionName }));
    }

    return [];
}
