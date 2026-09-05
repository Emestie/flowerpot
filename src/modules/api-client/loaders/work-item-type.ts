import { Loader } from "../loader";
import { IResponseWorkItem } from "../types";
import { IWorkItemType } from "../types/work-item-type";

export function createWorkItemTypeLoaders(loader: Loader) {
    const cache: Record<string, Promise<IWorkItemType>> = {};

    return {
        async getTypeInfo(wir: IResponseWorkItem): Promise<IWorkItemType | undefined> {
            const key = wir._links?.workItemType?.href;

            if (!key) return undefined;

            if (!cache[key]) {
                cache[key] = loader<IWorkItemType>(key);
            }

            return cache[key];
        },
    };
}
