import { Loader } from "../loader";
import { IWorkItemType } from "../types/work-item-type";

export function createWorkItemTypeLoaders(loader: Loader) {
    const cache: Record<string, Promise<IWorkItemType>> = {};

    return {
        async getTypeInfo(collectionName: string, projectName: string, typeName: string): Promise<IWorkItemType> {
            const key = [collectionName, projectName, typeName].join("$$");

            if (!cache[key]) {
                cache[key] = loader<IWorkItemType>(
                    collectionName + "/" + projectName + "/_apis/wit/workItemTypes/" + typeName
                );
            }

            return cache[key];
        },
    };
}
