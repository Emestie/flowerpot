import { afterEach, describe, expect, it, vi } from "vitest";
import { createLoader } from "../modules/api-client/loader";
import { s } from "../values/Strings";
import { makeJsonResponse, stubFetch, type TFetchResponder } from "./test-utils";

afterEach(() => {
    vi.unstubAllGlobals();
});

const TOKEN = "personal-access-token";

function makeParams(getTfsPath: () => string) {
    return {
        getAccountId: () => "acc1",
        getAccessToken: () => TOKEN,
        getTfsPath,
    };
}

describe("createLoader — url building", () => {
    it("joins a relative url with the base using exactly one slash", async () => {
        for (const base of [
            "https://tfs:8080/tfs/Collection2020",
            "https://tfs:8080/tfs/Collection2020/",
            "https://tfs:8080/tfs/Collection2020///",
        ]) {
            const calls = stubFetch(() => makeJsonResponse({ ok: 1 }));
            const loader = createLoader(makeParams(() => base));

            await loader("_apis/connectionData");

            expect(calls[0].url).toBe("https://tfs:8080/tfs/Collection2020/_apis/connectionData");
        }
    });

    it("strips extra slashes from a leading-slash path", async () => {
        const calls = stubFetch(() => makeJsonResponse({ ok: 1 }));
        const loader = createLoader(makeParams(() => "https://mstpwnz.visualstudio.com/"));

        await loader("/_api/_wit/teamProjects?__v=5");

        expect(calls[0].url).toBe("https://mstpwnz.visualstudio.com/_api/_wit/teamProjects?__v=5");
    });

    it("passes absolute urls through as-is", async () => {
        const calls = stubFetch(() => makeJsonResponse({ ok: 1 }));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));
        const absolute = "https://mstpwnz.vssps.visualstudio.com/_apis/identities?queryMembership=Direct";

        await loader(absolute);

        expect(calls[0].url).toBe(absolute);
    });
});

describe("createLoader — request options", () => {
    it("sends basic auth, suppress-redirect and json content type headers", async () => {
        const calls = stubFetch(() => makeJsonResponse({ ok: 1 }));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));

        await loader("_apis/connectionData");

        const headers = calls[0].init!.headers as Record<string, string>;
        expect(headers["Authorization"]).toBe("Basic " + btoa(":" + TOKEN));
        expect(headers["X-TFS-FedAuthRedirect"]).toBe("Suppress");
        expect(headers["Content-Type"]).toBe("application/json");
    });

    it("passes method, body and a custom content type through", async () => {
        const calls = stubFetch(() => makeJsonResponse({ ok: 1 }));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));

        await loader("Collection2020/_apis/wit/workItems/5?api-version=5.1", {
            method: "PATCH",
            contentType: "application/json-patch+json",
            body: '[{ "op": "add", "path": "/fields/System.State", "value": "Done" }]',
        });

        expect(calls[0].init!.method).toBe("PATCH");
        expect(calls[0].init!.body).toBe('[{ "op": "add", "path": "/fields/System.State", "value": "Done" }]');
        expect((calls[0].init!.headers as Record<string, string>)["Content-Type"]).toBe("application/json-patch+json");
    });

    it("sends POST bodies for batch requests", async () => {
        const calls = stubFetch(() => makeJsonResponse({ value: [] }));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));

        await loader("Collection2020/_apis/wit/workitemsbatch?api-version=5.1", {
            method: "POST",
            body: JSON.stringify({ ids: [1, 2] }),
        });

        expect(calls[0].init!.method).toBe("POST");
        expect(JSON.parse(calls[0].init!.body as string)).toEqual({ ids: [1, 2] });
    });
});

describe("createLoader — auth detection", () => {
    const unauthorizedCases: [number, string | undefined][] = [
        [401, "application/json"],
        [203, "text/html; charset=utf-8"],
        [200, "text/html"],
    ];

    it.each(unauthorizedCases)("treats status %i with %s as unauthorized", async (status, contentType) => {
        stubFetch(() => makeJsonResponse({}, { status, contentType: contentType as string | undefined }));
        const loader = createLoader(makeParams(() => "https://mstpwnz.visualstudio.com/"));

        await expect(loader("Collection2020/_api/_wit/teamProjects?__v=5")).rejects.toThrow(s("unauthorized"));
    });

    it("does not treat connectionData responses as unauthorized", async () => {
        const body = { authenticatedUser: { id: "abc" } };
        stubFetch(() => makeJsonResponse(body, { status: 401 }));
        const loader = createLoader(makeParams(() => "https://mstpwnz.visualstudio.com/"));

        const data = await loader("_apis/connectionData");

        expect(data).toEqual(body);
    });
});

describe("createLoader — response handling", () => {
    it("returns the parsed json body", async () => {
        const body = { value: [{ id: "c1", name: "Collection2020", url: "u" }] };
        stubFetch(() => makeJsonResponse(body));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));

        expect(await loader("_apis/projectCollections")).toEqual(body);
    });

    it("throws notFoundOrNoAccess on 404", async () => {
        stubFetch(() => makeJsonResponse({}, { status: 404 }));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));

        await expect(loader("Collection2020/_apis/wit/queries/missing")).rejects.toThrow(s("notFoundOrNoAccess"));
    });

    it("throws jsonParseError when a successful response is not json", async () => {
        stubFetch((): any => ({
            status: 200,
            ok: true,
            headers: new Headers(),
            json: async () => {
                throw new Error("<html>not json</html>");
            },
        }));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));

        await expect(loader("_apis/connectionData")).rejects.toThrow(s("jsonParseError"));
    });

    it("throws HTTP <status> when a failed response is not json", async () => {
        stubFetch((): any => ({
            status: 500,
            ok: false,
            headers: new Headers(),
            json: async () => {
                throw new Error("nope");
            },
        }));
        const loader = createLoader(makeParams(() => "https://tfs:8080/tfs/Collection2020/"));

        await expect(loader("_apis/connectionData")).rejects.toThrow("HTTP 500");
    });
});
