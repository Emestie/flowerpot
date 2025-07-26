import { createApiClient } from "../modules/api-client";
import { appViewSet } from "../redux/actions/appActions";
import { store } from "../redux/store";
import { s } from "../values/Strings";

//TODO: multiple api clients by account id

export const api = createApiClient({
    getAccountId() {
        return ""; //TODO:
    },
    getTfsPath() {
        return store.getState().settings.accounts[0].url;
    },
    getAccessToken() {
        return store.getState().settings.accounts[0].token;
    },
    onError(message) {
        if (store.getState().app.view !== "credentials")
            store.dispatch(appViewSet("error", { errorMessage: s("apiClientFetchError") + message }));
    },
});

export function getApi(accountId: string) {
    const account = store.getState().settings.accounts.find((x) => x.id === accountId);

    if (!account) throw new Error("No account with ID " + accountId);

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
        onError(message) {
            //TODO: error handling
            // if (store.getState().app.view !== "credentials")
            //     store.dispatch(appViewSet("error", { errorMessage: s("apiClientFetchError") + message }));
        },
    });
}
