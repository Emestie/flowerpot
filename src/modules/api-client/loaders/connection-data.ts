import CloudAdo from "../../../helpers/CloudAdo";
import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { IConnectionData, IIdentityMembership } from "../types";

const arrayChunks = <T>(array: T[], chunkSize: number) =>
    Array(Math.ceil(array.length / chunkSize))
        .fill(1)
        .map((_, index) => index * chunkSize)
        .map((begin) => array.slice(begin, begin + chunkSize));

export function createConnectionDataLoaders(params: IApiClientParams, loader: Loader) {
    return {
        async get(): Promise<IConnectionData | undefined> {
            const connectionData = await loader<IConnectionData | undefined>("_apis/connectionData", {
                skipConnectionDataCheck: true,
            });

            if (connectionData) {
                try {
                    //on ADO Services the _apis/identities API lives on the {org}.vssps
                    //service host instead of the org host, getVsspsUrl returns the same
                    //URL base for on-premises accounts
                    const identitiesBase = CloudAdo.getVsspsUrl(params.getTfsPath());
                    const subjectDescriptor = connectionData.authenticatedUser.subjectDescriptor;
                    const userMembership = await loader<IIdentityMembership>(
                        `${identitiesBase}_apis/identities?queryMembership=Direct&subjectDescriptors=${subjectDescriptor}&api-version=7.0`,
                        { skipConnectionDataCheck: true }
                    );
                    const descriptors = userMembership.value.flatMap((x) => x.memberOf);

                    if (descriptors.length) {
                        const chunks = arrayChunks(descriptors, 15);

                        const groups = (
                            await Promise.all(
                                chunks.map((chunk) =>
                                    loader<IIdentityMembership>(
                                        //queryMembership is required here: without it ADO Services
                                        //answers with a list of nulls instead of the identities
                                        `${identitiesBase}_apis/identities?queryMembership=Direct&descriptors=${chunk.join(
                                            ","
                                        )}&api-version=7.0`,
                                        { skipConnectionDataCheck: true }
                                    )
                                )
                            )
                        ).flatMap((x) => x.value);

                        connectionData.authenticatedUser.memberOfGroups = groups
                            .filter(Boolean)
                            .map((x) => x.providerDisplayName);
                    }
                } catch {
                    //group names are used for cosmetic purposes only (PR team badges),
                    //a failed identities lookup must not break the connection data flow
                }
            }

            return connectionData;
        },
    };
}
