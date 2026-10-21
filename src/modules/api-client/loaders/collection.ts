import CloudAdo from "../../../helpers/CloudAdo";
import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { ICollection, IResponseCollection, IValue } from "../types";

export function createCollectionLoaders(params: IApiClientParams, loader: Loader) {
    return {
        async getAll(): Promise<ICollection[]> {
            const collections = await loader<IValue<IResponseCollection[]>>(
                // "_api/_common/GetJumpList?showTeamsOnly=false&__v=5&navigationContextPackage={}&showStoppedCollections=false",
                "_apis/projectCollections?$top=1000"
            );

            //on ADO Services there is a single collection per organization and its name
            //(the org name) is not a valid URL path segment, so an empty one is used
            if (CloudAdo.isCloudUrl(params.getTfsPath())) {
                return [{ id: CloudAdo.getOrgName(params.getTfsPath()), name: "", url: params.getTfsPath() }];
            }

            return collections.value;
        },
    };
}
