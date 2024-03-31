import { Loader } from "../loader";
import { IConnectionData, IIdentityMembership } from "../types";

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
                    const groups = await loader<IIdentityMembership>(
                        `_apis/identities?queryMembership=Direct&descriptors=${descriptors.join(",")}&api-version=7.0`,
                        { skipConnectionDataCheck: true }
                    );

                    connectionData.authenticatedUser.memberOfGroups = groups.value.map((x) => x.providerDisplayName);
                }
            }

            return connectionData;
        },
    };
}
