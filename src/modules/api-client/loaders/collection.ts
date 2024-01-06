import { Loader } from "../loader";
import { ICollection, IResponseCollection, IValue } from "../types";

export function createCollectionLoaders(loader: Loader) {
    return {
        async getAll(): Promise<ICollection[]> {
            const collections = await loader<IValue<IResponseCollection[]>>(
                // "_api/_common/GetJumpList?showTeamsOnly=false&__v=5&navigationContextPackage={}&showStoppedCollections=false",
                "_apis/projectCollections?$top=1000",
            );

            return collections.value;
        },
    };
}
