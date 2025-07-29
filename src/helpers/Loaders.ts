import { createApiClient } from "../modules/api-client";

export default class Loaders {
    public static async checkCredentials(url: string, token: string) {
        try {
            const api = createApiClient({
                getAccountId() {
                    return "";
                },
                getAccessToken() {
                    return token;
                },
                getTfsPath() {
                    return url;
                },
                onError() {
                    throw new Error("Some api error during account validations");
                },
            });
            await api.collection.getAll();
            return true;
        } catch (ex: any) {
            return false;
        }
    }

    public static async checkTfsPath(url: string) {
        try {
            let res = await fetch(url);
            if (res.status !== 401 && res.status !== 200) return false;
            else return true;
        } catch (ex: any) {
            return false;
        }
    }

    public static async getUserData(url: string, token: string) {
        const api = createApiClient({
            getAccountId() {
                return "";
            },
            getAccessToken() {
                return token;
            },
            getTfsPath() {
                return url;
            },
            onError() {
                throw new Error("Some api error during connection check");
            },
        });

        const conn = await api.connectionData.get();

        return {
            displayName: conn?.authenticatedUser.providerDisplayName,
            descriptor: conn?.authenticatedUser.subjectDescriptor,
        };
    }
}
