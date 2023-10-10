import { createApiClient } from "../modules/api-client";
import { store } from "../redux/store";

export const api = createApiClient({
    getTfsPath() {
        return store.getState().settings.tfsPath;
    },
    getAccessToken() {
        return store.getState().settings.tfsPat;
    },
});
