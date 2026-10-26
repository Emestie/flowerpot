import { afterEach, describe, expect, it, vi } from "vitest";
import Loaders from "../helpers/Loaders";
import { CLOUD_URL, makeJsonResponse, respondByExactUrl, stubFetch, type IFetchCall } from "./test-utils";

afterEach(() => {
    vi.unstubAllGlobals();
});

const TOKEN = "t".repeat(50);

const PERM_CHECK_URLS = [
    CLOUD_URL + "_apis/projectCollections?$top=1",
    CLOUD_URL + "_apis/wit/fields?$top=1&api-version=5.1",
    CLOUD_URL + "_apis/git/repositories?$top=1&api-version=7.0",
    CLOUD_URL + "_apis/connectionData",
];

function assertSuppressHeader(call: IFetchCall) {
    expect((call.init!.headers as Record<string, string>)["X-TFS-FedAuthRedirect"]).toBe("Suppress");
}

describe("Loaders.checkCredentials", () => {
    it("canonicalizes a dev.azure.com url and proves the token via projectCollections", async () => {
        const calls = stubFetch(() => makeJsonResponse({ value: [] }));

        const result = await Loaders.checkCredentials("https://dev.azure.com/mstpwnz", TOKEN);

        expect(result).toBe(true);
        expect(calls[0].url).toBe(CLOUD_URL + "_apis/projectCollections?$top=1000");
        assertSuppressHeader(calls[0]);
        expect((calls[0].init!.headers as Record<string, string>)["Authorization"]).toBe("Basic " + btoa(":" + TOKEN));
    });

    it("passes an on-premises url through unchanged", async () => {
        const calls = stubFetch(() => makeJsonResponse({ value: [] }));

        const result = await Loaders.checkCredentials("https://msktfs.eos.ru:8443/tfs/Collection2020/", TOKEN);

        expect(result).toBe(true);
        expect(calls[0].url).toBe("https://msktfs.eos.ru:8443/tfs/Collection2020/_apis/projectCollections?$top=1000");
    });

    it("returns false on unauthorized", async () => {
        stubFetch(() => makeJsonResponse({}, { status: 401 }));

        const result = await Loaders.checkCredentials(CLOUD_URL, "wrong-token");

        expect(result).toBe(false);
    });
});

describe("Loaders.checkPermissions", () => {
    it("checks all four scopes with the suppress header", async () => {
        const calls = stubFetch(() => makeJsonResponse({}));

        const result = await Loaders.checkPermissions(CLOUD_URL, TOKEN);

        expect(result).toEqual({ ok: true });
        expect(calls.map((c) => c.url)).toEqual(PERM_CHECK_URLS);
        calls.forEach(assertSuppressHeader);
    });

    it("reports a scope missing on 403", async () => {
        stubFetch((url) =>
            url.includes("_apis/wit/fields") ? makeJsonResponse({}, { status: 403 }) : makeJsonResponse({})
        );

        const result = await Loaders.checkPermissions(CLOUD_URL, TOKEN);

        expect(result).toEqual({ ok: false, missingPermissions: ["vso.work"] });
    });

    it("reports a scope missing on 401", async () => {
        stubFetch((url) =>
            url.includes("projectCollections") ? makeJsonResponse({}, { status: 401 }) : makeJsonResponse({})
        );

        const result = await Loaders.checkPermissions(CLOUD_URL, TOKEN);

        expect(result).toEqual({ ok: false, missingPermissions: ["vso.project"] });
    });

    it("reports a scope missing when the body carries an error code", async () => {
        stubFetch(respondByExactUrl({ [PERM_CHECK_URLS[1]]: { errorCode: 1, message: "denied" } }));

        const result = await Loaders.checkPermissions(CLOUD_URL, TOKEN);

        expect(result).toEqual({ ok: false, missingPermissions: ["vso.work"] });
    });

    it("ignores network errors", async () => {
        const calls = stubFetch((url) => {
            if (url.includes("_apis/git")) throw new Error("network down");
            return makeJsonResponse({});
        });

        const result = await Loaders.checkPermissions(CLOUD_URL, TOKEN);

        expect(result).toEqual({ ok: true });
        expect(calls).toHaveLength(4);
    });
});

describe("Loaders.getUserData", () => {
    it("returns the display name and subject descriptor", async () => {
        stubFetch((url) => {
            if (url.endsWith("_apis/connectionData")) {
                return makeJsonResponse({
                    authenticatedUser: {
                        id: "aad.user-id",
                        subjectDescriptor: "aad.me",
                        providerDisplayName: "Test User",
                        isActive: true,
                        properties: {},
                    },
                    deploymentType: "hosted",
                });
            }

            //identities lookup on the vssps host, empty memberOf stops the flow
            return makeJsonResponse({ value: [{ id: "i1", providerDisplayName: "Test User", memberOf: [] }] });
        });

        const userData = await Loaders.getUserData("https://dev.azure.com/mstpwnz", TOKEN);

        expect(userData).toEqual({ displayName: "Test User", descriptor: "aad.me" });
    });
});
