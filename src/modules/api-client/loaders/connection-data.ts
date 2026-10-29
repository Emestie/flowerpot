import CloudAdo from "../../../helpers/CloudAdo";
import { IApiClientParams } from "../create";
import { Loader } from "../loader";
import { IConnectionData, IIdentityMembership } from "../types";

const arrayChunks = <T>(array: T[], chunkSize: number) =>
    Array(Math.ceil(array.length / chunkSize))
        .fill(1)
        .map((_, index) => index * chunkSize)
        .map((begin) => array.slice(begin, begin + chunkSize));

const readMemberOf = (response: IIdentityMembership | undefined) =>
    (response?.value || []).flatMap((x) => x?.memberOf || []);

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
                    const membershipUrl = (membership: string) =>
                        `${identitiesBase}_apis/identities?queryMembership=${membership}&subjectDescriptors=${subjectDescriptor}&api-version=7.0`;

                    //Expanded, not Direct: a PR can list a reviewer group that only
                    //*contains* a group the user belongs to (`Approvers <- Team <- me`),
                    //and ADO counts that as the user being a reviewer. Direct membership
                    //stops at one level, so such PRs looked like they were not the
                    //user's at all and were filtered out of the pull requests list
                    const expanded = await loader<IIdentityMembership>(membershipUrl("Expanded"), {
                        skipConnectionDataCheck: true,
                    }).catch(() => undefined);

                    //an answered-but-unusable payload (an error object, an older server
                    //ignoring the parameter) is retried as direct membership
                    const membership = Array.isArray(expanded?.value)
                        ? expanded
                        : await loader<IIdentityMembership>(membershipUrl("Direct"), { skipConnectionDataCheck: true });

                    const descriptors = Array.from(new Set(readMemberOf(membership).filter(Boolean)));

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
                        )
                            .flatMap((x) => x?.value || [])
                            .filter(Boolean);

                        //both are kept: ids survive renamed or scoped groups, names keep
                        //working when reviewers come back without an id
                        connectionData.authenticatedUser.memberOfGroups = groups.map((x) => x.providerDisplayName);
                        connectionData.authenticatedUser.memberOfGroupIds = groups.map((x) => x.id);
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
