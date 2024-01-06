import { createApiClient } from "../modules/api-client";
import { store } from "../redux/store";

export const api = createApiClient({
    getTfsPath() {
        return store.getState().settings.tfsPath;
    },
    getTfsUser() {
        return store.getState().settings.tfsUser;
    },
    getAccessToken() {
        return store.getState().settings.tfsToken;
    },
});
