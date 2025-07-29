import chunk from "lodash/chunk";
import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { buildWorkItem } from "../models";
import { IQuery, IQueryResult, IResponseWorkItem, IValue, IWorkItem, IWorkItemShort } from "../types";
import { createWorkItemTypeLoaders } from "./work-item-type";
import Differences from "/@/helpers/Differences";
import Lists from "/@/helpers/Lists";
import Query from "/@/helpers/Query";
import { getListsSelector } from "/@/redux/selectors/settingsSelectors";
import { store } from "/@/redux/store";

export function createWorkItemLoaders(
    params: IApiClientParams,
    loader: Loader,
    workItemTypeLoaders: ReturnType<typeof createWorkItemTypeLoaders>
) {
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
                              "?api-version=5.1"
                      );

            //if query was deleted
            if (queryResult?.errorCode === 600288) {
                Query.delete(query);
                return [];
            }

            if (queryResult?.message && queryResult.errorCode !== undefined) {
                throw new Error(queryResult.message);
            }

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
                collection + "/_apis/wit/workItems/" + id + "?api-version=5.1"
            );

            if (!workItemResponse.id) {
                Lists.deleteFromList(params.getAccountId(), "permawatch", id, collection);
                return null;
            }

            const workItemType = await workItemTypeLoaders.getTypeInfo(workItemResponse);

            return buildWorkItem(workItemResponse, query, workItemType);
        },
        async getList(list: IWorkItemShort[], query: IQuery): Promise<IWorkItem[]> {
            const collections = list.map((x) => x.collection).filter((i, v, a) => a.indexOf(i) === v);

            const workItemResponses = await Promise.all(
                collections.flatMap((collection) => {
                    const ids = list.filter((l) => l.collection === collection).map((l) => l.id);
                    const chunkedIds = chunk(ids, 200);

                    return chunkedIds.map((ids) => {
                        return loader<IValue<IResponseWorkItem[]>>(
                            collection + "/_apis/wit/workitemsbatch?api-version=5.1",
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    ids: ids,
                                    $expand: "links",
                                }),
                            }
                        ).then((resp) => {
                            if (resp.message) throw new Error(resp.message);
                            return resp;
                        });
                    });
                })
            );

            const workItemTypes = await Promise.all(
                workItemResponses.flatMap((x) => x.value).map((wir) => workItemTypeLoaders.getTypeInfo(wir))
            );

            return workItemResponses
                .flatMap((x) => x.value)
                .map((wir, index) => buildWorkItem(wir, query, workItemTypes[index]));
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
