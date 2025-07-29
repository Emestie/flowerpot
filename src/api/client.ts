import { createApiClient } from "../modules/api-client";
import { store } from "../redux/store";

export function getApi(accountId: string) {
    const account = store.getState().settings.accounts.find((x) => x.id === accountId);

    if (!account) throw new Error(`No account with ID '${accountId}'`);

    return createApiClient({
        getAccountId() {
            return accountId;
        },
        getTfsPath() {
            return account.url;
        },
        getAccessToken() {
            return account.token;
        },
    });
}
