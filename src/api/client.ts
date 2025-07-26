import { createApiClient } from "../modules/api-client";
import { appViewSet } from "../redux/actions/appActions";
import { store } from "../redux/store";
import { s } from "../values/Strings";

//TODO: multiple api clients by account id

export const api = createApiClient({
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
