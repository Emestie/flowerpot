import { Loader } from "../loader";
import { IConnectionData, IIdentityMembership } from "../types";

const arrayChunks = <T>(array: T[], chunkSize: number) =>
    Array(Math.ceil(array.length / chunkSize))
        .fill(1)
        .map((_, index) => index * chunkSize)
        .map((begin) => array.slice(begin, begin + chunkSize));

export function createConnectionDataLoaders(loader: Loader) {
    return {
        async get(): Promise<IConnectionData | undefined> {
            const connectionData = await loader<IConnectionData | undefined>("_apis/connectionData", {
                skipConnectionDataCheck: true,
            });

            if (connectionData) {
                const subjectDescriptor = connectionData.authenticatedUser.subjectDescriptor;
                const userMembership = await loader<IIdentityMembership>(
                    `_apis/identities?queryMembership=Direct&subjectDescriptors=${subjectDescriptor}&api-version=7.0`,
                    { skipConnectionDataCheck: true }
                );
                const descriptors = userMembership.value.flatMap((x) => x.memberOf);

                if (descriptors.length) {
                    const chunks = arrayChunks(descriptors, 15);

                    const groups = (
                        await Promise.all(
                            chunks.map((chunk) =>
                                loader<IIdentityMembership>(
                                    `_apis/identities?queryMembership=Direct&descriptors=${chunk.join(
                                        ","
                                    )}&api-version=7.0`,
                                    { skipConnectionDataCheck: true }
                                )
                            )
                        )
                    ).flatMap((x) => x.value);

                    connectionData.authenticatedUser.memberOfGroups = groups.map((x) => x.providerDisplayName);
                }
            }

            return connectionData;
        },
    };
}
