import { createApiClient } from "../modules/api-client";

export type PermissionCheckResult = { ok: true } | { ok: false; missingPermissions: string[] };

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
            });
            await api.collection.getAll();
            return true;
        } catch (ex: any) {
            return false;
        }
    }

    public static async checkPermissions(url: string, token: string): Promise<PermissionCheckResult> {
        const authHeader = "Basic " + btoa(":" + token);

        const checks: { label: string; url: string }[] = [
            { label: "vso.project", url: url + "_apis/projectCollections?$top=1" },
            { label: "vso.work", url: url + "_apis/wit/fields?$top=1&api-version=5.1" },
            { label: "vso.code", url: url + "_apis/git/repositories?$top=1&api-version=7.0" },
            { label: "vso.identity", url: url + "_apis/connectionData" },
        ];

        const missingPermissions: string[] = [];

        for (const check of checks) {
            try {
                const result = await fetch(check.url, {
                    method: "GET",
                    headers: {
                        Authorization: authHeader,
                        "Content-Type": "application/json",
                    },
                });

                if (result.status === 403 || result.status === 401) {
                    missingPermissions.push(check.label);
                    continue;
                }

                try {
                    const body = await result.json();
                    if (body?.errorCode !== undefined || body?.message) {
                        missingPermissions.push(check.label);
                    }
                } catch {
                    // Not JSON — that's fine
                }
            } catch {
                // Network error — skip, don't treat as missing permission
            }
        }

        if (missingPermissions.length > 0) {
            return { ok: false, missingPermissions };
        }

        return { ok: true };
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
        });

        const conn = await api.connectionData.get();

        return {
            displayName: conn?.authenticatedUser.providerDisplayName,
            descriptor: conn?.authenticatedUser.subjectDescriptor,
        };
    }
}
