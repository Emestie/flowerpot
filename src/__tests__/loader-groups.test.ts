import { afterEach, describe, expect, it, vi } from "vitest";
import { createCollectionLoaders } from "../modules/api-client/loaders/collection";
import { createConnectionDataLoaders } from "../modules/api-client/loaders/connection-data";
import { createProjectLoaders } from "../modules/api-client/loaders/project";
import { createQueryLoaders } from "../modules/api-client/loaders/query";
import { createWorkItemLoaders } from "../modules/api-client/loaders/work-item";
import { createWorkItemTypeLoaders } from "../modules/api-client/loaders/work-item-type";
import { s } from "../values/Strings";
import { useSettingsStore } from "../zustand/settings";
import {
    CLOUD_URL,
    ON_PREM_URL,
    PROJECT_GUID,
    PROJECT_NAME,
    QUERY_ID,
    fakeLoader,
    makeQuery,
    makeWorkItem,
    resetStores,
} from "./test-utils";
import type { IApiClientParams } from "../modules/api-client/create";

afterEach(() => {
    resetStores();
    vi.clearAllMocks();
});

function makeParams(getTfsPath: () => string): IApiClientParams {
    return {
        getAccountId: () => "acc1",
        getAccessToken: () => "token",
        getTfsPath,
    };
}

describe("collection loader", () => {
    it("returns a synthetic empty-named collection for cloud accounts", async () => {
        const { loader, urls } = fakeLoader(() => ({ value: [] }));
        const api = createCollectionLoaders(
            makeParams(() => CLOUD_URL),
            loader
        );

        const collections = await api.getAll();

        //the call still happens: for cloud it doubles as the credential proof
        expect(urls).toEqual(["_apis/projectCollections?$top=1000"]);
        expect(collections).toEqual([{ id: "mstpwnz", name: "", url: CLOUD_URL }]);
    });

    it("passes real collections through for on-premises accounts", async () => {
        const serverCollections = [{ id: "c1", name: "Collection2020", url: "https://tfs/tfs/Collection2020" }];
        const { loader, urls } = fakeLoader(() => ({ value: serverCollections }));
        const api = createCollectionLoaders(
            makeParams(() => ON_PREM_URL),
            loader
        );

        const collections = await api.getAll();

        expect(urls).toEqual(["_apis/projectCollections?$top=1000"]);
        expect(collections).toEqual(serverCollections);
    });
});

describe("connection-data loader", () => {
    //fresh object per test: the loader mutates authenticatedUser.memberOfGroups
    function makeConnData() {
        return {
            authenticatedUser: {
                id: "aad.user-id",
                subjectDescriptor: "aad.me",
                providerDisplayName: "Test User",
                isActive: true,
                properties: {},
            },
            deploymentType: "hosted",
        };
    }

    function makeDescriptors(count: number) {
        return Array.from({ length: count }, (_, i) => "aad.g" + i);
    }

    it("resolves group names via the vssps host with expanded membership", async () => {
        const descriptors = makeDescriptors(20); //forces two chunks of 15 and 5
        const connData = makeConnData();
        const { loader, urls } = fakeLoader((url) => {
            if (url === "_apis/connectionData") return connData;

            if (url.includes("subjectDescriptors=")) {
                return { value: [{ id: "i1", providerDisplayName: "Test User", memberOf: descriptors }] };
            }

            const chunk = new URL(url).searchParams.get("descriptors")!.split(",");
            return {
                value: chunk.map((d) => ({ id: "id-" + d, providerDisplayName: "Group " + d, memberOf: [] })),
            };
        });

        const result = await createConnectionDataLoaders(
            makeParams(() => CLOUD_URL),
            loader
        ).get();

        expect(urls[0]).toBe("_apis/connectionData");
        expect(urls[1]).toBe(
            "https://mstpwnz.vssps.visualstudio.com/_apis/identities?queryMembership=Expanded&subjectDescriptors=aad.me&api-version=7.0"
        );
        expect(urls).toHaveLength(4);
        expect(urls[2]).toContain("descriptors=" + descriptors.slice(0, 15).join(","));
        expect(urls[3]).toContain("descriptors=" + descriptors.slice(15).join(","));
        for (const url of urls.slice(2)) {
            expect(url).toContain("queryMembership=Direct");
        }

        expect(result!.authenticatedUser.memberOfGroups).toEqual(descriptors.map((d) => "Group " + d));
        expect(result!.authenticatedUser.memberOfGroupIds).toEqual(descriptors.map((d) => "id-" + d));
    });

    it("keeps the groups reached through nesting and drops duplicates", async () => {
        const connData = makeConnData();
        const { loader } = fakeLoader((url) => {
            if (url === "_apis/connectionData") return connData;

            if (url.includes("subjectDescriptors=")) {
                //the user's own team plus the approver group that contains it
                return {
                    value: [{ id: "i1", providerDisplayName: "Test User", memberOf: ["aad.team", "aad.approvers"] }],
                };
            }

            if (url.includes("aad.team") && url.includes("aad.approvers")) {
                return {
                    value: [
                        { id: "team-id", providerDisplayName: "DeloWeb", memberOf: [] },
                        { id: "approvers-id", providerDisplayName: "DeloWebApprovers", memberOf: [] },
                    ],
                };
            }

            return { value: [] };
        });

        const result = await createConnectionDataLoaders(
            makeParams(() => CLOUD_URL),
            loader
        ).get();

        expect(result!.authenticatedUser.memberOfGroups).toEqual(["DeloWeb", "DeloWebApprovers"]);
        expect(result!.authenticatedUser.memberOfGroupIds).toEqual(["team-id", "approvers-id"]);
    });

    it("falls back to direct membership when the server rejects expanded", async () => {
        const connData = makeConnData();
        const { loader, urls } = fakeLoader((url) => {
            if (url === "_apis/connectionData") return connData;

            if (url.includes("queryMembership=Expanded")) return { message: "Bad request", errorCode: 1 };

            if (url.includes("subjectDescriptors=")) {
                return { value: [{ id: "i1", providerDisplayName: "Test User", memberOf: ["aad.team"] }] };
            }

            return { value: [{ id: "team-id", providerDisplayName: "DeloWeb", memberOf: [] }] };
        });

        const result = await createConnectionDataLoaders(
            makeParams(() => CLOUD_URL),
            loader
        ).get();

        expect(urls[1]).toContain("queryMembership=Expanded");
        expect(urls[2]).toContain("queryMembership=Direct");
        expect(result!.authenticatedUser.memberOfGroups).toEqual(["DeloWeb"]);
    });

    it("does not fail the whole flow when the identities lookup breaks", async () => {
        const connData = makeConnData();
        const { loader, urls } = fakeLoader((url) => {
            if (url === "_apis/connectionData") return connData;
            throw new Error("identities api down");
        });

        const result = await createConnectionDataLoaders(
            makeParams(() => CLOUD_URL),
            loader
        ).get();

        expect(result).toEqual(connData);
        expect(result!.authenticatedUser.memberOfGroups).toBeUndefined();
        //expanded, its direct fallback, and nothing else
        expect(urls).toHaveLength(3);
    });

    it("uses the same base for on-premises identities", async () => {
        const connData = makeConnData();
        const { loader, urls } = fakeLoader((url) => {
            if (url === "_apis/connectionData") return connData;
            return { value: [{ id: "i1", providerDisplayName: "Test User", memberOf: [] }] };
        });

        await createConnectionDataLoaders(
            makeParams(() => ON_PREM_URL),
            loader
        ).get();

        expect(urls[1]).toBe(
            ON_PREM_URL + "_apis/identities?queryMembership=Expanded&subjectDescriptors=aad.me&api-version=7.0"
        );
    });
});

describe("project loader", () => {
    const teamProjects = { projects: [{ guid: PROJECT_GUID, name: PROJECT_NAME }] };

    it("builds cloud project urls from an empty collection name", async () => {
        const { loader, urls } = fakeLoader((url) =>
            url.includes("_api/_wit/teamProjects") ? teamProjects : { value: [] }
        );

        const projects = await createProjectLoaders(
            makeParams(() => CLOUD_URL),
            loader
        ).getAll();

        expect(urls[1]).toBe("/_api/_wit/teamProjects?__v=5");
        expect(projects).toHaveLength(1);
        expect(projects[0]).toMatchObject({
            accountId: "acc1",
            guid: PROJECT_GUID,
            name: PROJECT_NAME,
            collectionName: "",
            path: PROJECT_NAME,
            enabled: true,
        });
    });

    it("prefixes the path with the collection for on-premises accounts", async () => {
        const { loader, urls } = fakeLoader((url) =>
            url.includes("_api/_wit/teamProjects")
                ? teamProjects
                : { value: [{ id: "c1", name: "Collection2020", url: "" }] }
        );

        const projects = await createProjectLoaders(
            makeParams(() => ON_PREM_URL),
            loader
        ).getAll();

        expect(urls[1]).toBe("Collection2020/_api/_wit/teamProjects?__v=5");
        expect(projects[0]).toMatchObject({
            collectionName: "Collection2020",
            path: "Collection2020/" + PROJECT_NAME,
        });
    });
});

describe("query loader", () => {
    const queryFolder = {
        id: "folder1",
        isFolder: true,
        isPublic: true,
        name: "Shared Queries",
        path: "Shared Queries",
        children: [
            {
                id: QUERY_ID,
                isFolder: false,
                isPublic: true,
                name: "Assigned to me",
                path: "Shared Queries/Assigned to me",
            },
        ],
    };
    const teamProjects = { projects: [{ guid: PROJECT_GUID, name: PROJECT_NAME }] };

    const singleQuery = {
        id: QUERY_ID,
        isFolder: false,
        isPublic: true,
        name: "Assigned to me",
        path: "Shared Queries/Assigned to me",
    };

    function responder(url: string) {
        if (url === "_apis/projectCollections?$top=1000") {
            //used as-is on-premises, replaced by the synthetic one for cloud
            return { value: [{ id: "c1", name: "Collection2020", url: "" }] };
        }
        if (url.includes("_api/_wit/teamProjects")) return teamProjects;
        if (url.includes("$depth=2")) return { value: [queryFolder] };
        if (url.includes("_apis/wit/queries")) return singleQuery;
        return {};
    }

    it("loads queries with an empty collection segment for cloud accounts", async () => {
        const { loader, urls } = fakeLoader(responder);

        const queries = await createQueryLoaders(
            makeParams(() => CLOUD_URL),
            loader
        ).getAvailable();

        expect(urls[1]).toBe("/_api/_wit/teamProjects?__v=5");
        expect(urls[2]).toBe(`/${PROJECT_GUID}/_apis/wit/queries?$depth=2&api-version=5.1`);
        expect(queries).toHaveLength(1);
        expect(queries[0].queryId).toBe(QUERY_ID);
        expect(queries[0].collectionName).toBe("");
        expect(queries[0].nameInList).toBe(`${PROJECT_NAME} / Shared Queries / Assigned to me`);
    });

    it("prefixes cloud-less urls with the collection for on-premises accounts", async () => {
        const { loader, urls } = fakeLoader(responder);

        const queries = await createQueryLoaders(
            makeParams(() => ON_PREM_URL),
            loader
        ).getAvailable();

        expect(urls[1]).toBe("Collection2020/_api/_wit/teamProjects?__v=5");
        expect(urls[2]).toBe(`Collection2020/${PROJECT_GUID}/_apis/wit/queries?$depth=2&api-version=5.1`);
        expect(queries[0].nameInList).toBe(`Collection2020 / ${PROJECT_NAME} / Shared Queries / Assigned to me`);
    });

    it("loads a query by its browser url", async () => {
        const { loader, urls } = fakeLoader(responder);
        const browserUrl = `${CLOUD_URL}${PROJECT_NAME}/_queries/query/${QUERY_ID}/`;

        const query = await createQueryLoaders(
            makeParams(() => CLOUD_URL),
            loader
        ).getByUrl(browserUrl);

        //trailing slash trimmed, _queries/query replaced with the api route
        expect(urls[0]).toBe(`${CLOUD_URL}${PROJECT_NAME}/_apis/wit/queries/${QUERY_ID}`);
        expect(query.queryId).toBe(QUERY_ID);
        expect(query.collectionName).toBe("");
        expect(query.teamName).toBe(PROJECT_NAME);
    });

    it("rejects urls that are not query urls", async () => {
        const { loader } = fakeLoader(responder);

        await expect(
            createQueryLoaders(
                makeParams(() => CLOUD_URL),
                loader
            ).getByUrl("https://example.com/something")
        ).rejects.toThrow(s("queryByUrlError1"));
    });
});

describe("work-item loaders", () => {
    const workItemsBatch = (ids: number[]) => ({
        value: ids.map((id) => makeWorkItemResponse(id)),
    });

    function makeWorkItemResponse(id: number) {
        return {
            id,
            rev: 2,
            url: "",
            fields: {
                "System.Title": "WI " + id,
                "System.State": "New",
                "System.WorkItemType": "User Story",
                "System.CreatedDate": "2026-01-01T10:00:00Z",
            },
        };
    }

    it("loads flat query results via wiql and workitemsbatch", async () => {
        const { loader, urls, inits } = fakeLoader((url) =>
            url.includes("_apis/wit/wiql/")
                ? { queryType: "flat", workItems: [{ id: 1 }, { id: 2 }] }
                : workItemsBatch([1, 2])
        );
        const query = makeQuery("acc1", "Collection2020", { queryId: "q-flat-1" });

        const { workItems, hiddenCount } = await createWorkItemLoaders(
            makeParams(() => ON_PREM_URL),
            loader,
            createWorkItemTypeLoaders(loader)
        ).getByQuery(query);

        expect(urls[0]).toBe(`Collection2020/${PROJECT_GUID}/_apis/wit/wiql/q-flat-1?api-version=5.1`);
        expect(urls[1]).toBe("Collection2020/_apis/wit/workitemsbatch?api-version=5.1");
        expect(inits[1].method).toBe("POST");
        expect(JSON.parse(inits[1].body)).toEqual({ ids: [1, 2], $expand: "links" });

        expect(hiddenCount).toBe(0);
        expect(workItems.map((wi) => wi.id)).toEqual([1, 2]);
        expect(workItems[0]._queryId).toBe("q-flat-1");
        expect(workItems[0]._collectionName).toBe("Collection2020");
    });

    it("skips wiql for permawatch pseudo-queries", async () => {
        useSettingsStore.getState().setList("permawatch", [{ accountId: "acc1", id: 7, rev: 1, collection: "" }]);

        const { loader, urls, inits } = fakeLoader((url) => workItemsBatch([7]));
        const query = makeQuery("acc1", "", { queryId: "___permawatch_acc1" });

        const { workItems, hiddenCount } = await createWorkItemLoaders(
            makeParams(() => CLOUD_URL),
            loader,
            createWorkItemTypeLoaders(loader)
        ).getByQuery(query);

        expect(urls).toEqual(["/_apis/wit/workitemsbatch?api-version=5.1"]);
        expect(JSON.parse(inits[0].body)).toEqual({ ids: [7], $expand: "links" });
        expect(workItems).toHaveLength(1);
        expect(workItems[0].id).toBe(7);
        expect(hiddenCount).toBe(0);
    });

    it("drops a deleted query and returns nothing on error 600288", async () => {
        const query = makeQuery("acc1", "Collection2020", { queryId: "q-dead" });
        useSettingsStore.getState().setQueries([query]);

        const { loader, urls } = fakeLoader(() => ({ errorCode: 600288 }));

        const { workItems, hiddenCount } = await createWorkItemLoaders(
            makeParams(() => ON_PREM_URL),
            loader,
            createWorkItemTypeLoaders(loader)
        ).getByQuery(query);

        expect(workItems).toEqual([]);
        expect(hiddenCount).toBe(0);
        expect(useSettingsStore.getState().queries.find((q) => q.queryId === "q-dead")).toBeUndefined();
    });

    it("throws the server message when the query result carries an error", async () => {
        const { loader } = fakeLoader(() => ({ message: "Boom", errorCode: 1 }));
        const query = makeQuery("acc1", "Collection2020", { queryId: "q-err" });

        await expect(
            createWorkItemLoaders(
                makeParams(() => ON_PREM_URL),
                loader,
                createWorkItemTypeLoaders(loader)
            ).getByQuery(query)
        ).rejects.toThrow("Boom");
    });

    it("loads a single work item by id", async () => {
        const { loader, urls } = fakeLoader(() => makeWorkItemResponse(5));
        const query = makeQuery("acc1", "Collection2020", { queryId: "q-one-1" });

        const workItem = await createWorkItemLoaders(
            makeParams(() => ON_PREM_URL),
            loader,
            createWorkItemTypeLoaders(loader)
        ).getOne({ id: 5, collection: "Collection2020" }, query);

        expect(urls[0]).toBe("Collection2020/_apis/wit/workItems/5?api-version=5.1");
        expect(workItem!.id).toBe(5);
        expect(workItem!._queryId).toBe("q-one-1");
    });

    it("updates a work item state with a json-patch body", async () => {
        const { loader, urls, inits } = fakeLoader(() => makeWorkItemResponse(5));
        const query = makeQuery("acc1", "Collection2020", { queryId: "q-upd-1" });
        const workItem = makeWorkItem(query, { id: 5 });

        await createWorkItemLoaders(
            makeParams(() => ON_PREM_URL),
            loader,
            createWorkItemTypeLoaders(loader)
        ).updateState(workItem, "Done", query);

        expect(urls[0]).toBe("Collection2020/_apis/wit/workItems/5?api-version=5.1");
        expect(inits[0].method).toBe("PATCH");
        expect(inits[0].contentType).toBe("application/json-patch+json");
        expect(JSON.parse(inits[0].body)).toEqual([{ op: "add", path: "/fields/System.State", value: "Done" }]);
    });
});

describe("work-item-type loader", () => {
    it("passes absolute hrefs through and caches repeated types", async () => {
        const href = `${CLOUD_URL}${PROJECT_NAME}/_apis/wit/workItemTypes/User%20Story?api-version=5.1`;
        const typeInfo = {
            name: "User Story",
            referenceName: "Microsoft.UserStory",
            description: "",
            color: "",
            icon: { id: "icon", url: "icon.png" },
            isDisabled: false,
            states: [{ name: "New", color: "green", category: "Proposed" }],
            url: href,
        };
        const { loader, urls } = fakeLoader((url) => (url === href ? typeInfo : {}));

        const api = createWorkItemTypeLoaders(loader);
        const wir: any = { id: 1, _links: { workItemType: { href } } };

        const type1 = await api.getTypeInfo(wir);
        const type2 = await api.getTypeInfo(wir);

        expect(urls).toEqual([href]);
        expect(type1).toBe(typeInfo);
        expect(type2).toBe(typeInfo);
    });

    it("returns undefined when the response has no type link", async () => {
        const { loader, urls } = fakeLoader(() => ({}));

        const type = await createWorkItemTypeLoaders(loader).getTypeInfo({ id: 1 } as any);

        expect(type).toBeUndefined();
        expect(urls).toEqual([]);
    });
});
