import { createApiClient } from "../modules/api-client";
import { appViewSet } from "../redux/actions/appActions";
import { store } from "../redux/store";
import { s } from "../values/Strings";

export const api = createApiClient({
    getTfsPath() {
        return store.getState().settings.tfsPath;
    },
    getAccessToken() {
        return store.getState().settings.tfsToken;
    },
    onError(message) {
        if (store.getState().app.view !== "credentials")
            store.dispatch(appViewSet("error", { errorMessage: s("apiClientFetchError") + message }));
    },
});
