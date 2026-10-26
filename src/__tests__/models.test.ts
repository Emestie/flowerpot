import { afterEach, describe, expect, it, vi } from "vitest";
import { getConnectionData } from "../helpers/Connection";
import { PullRequest } from "../models/pull-request";
import { Project } from "../models/project";
import { Query } from "../models/query";
import { CLOUD_URL, ON_PREM_URL, PROJECT_GUID, PROJECT_NAME, makeQuery, resetStores } from "./test-utils";
import type { IConnectionData } from "../modules/api-client/types";

vi.mock("../helpers/Connection", () => ({ getConnectionData: vi.fn() }));

const mockedGetConnectionData = vi.mocked(getConnectionData);

afterEach(() => {
    resetStores();
    mockedGetConnectionData.mockReset();
});

describe("Project model", () => {
    it("uses a bare project name as path for cloud accounts", () => {
        const project = new Project("acc1", { guid: PROJECT_GUID, name: PROJECT_NAME }, "");

        expect(project.path).toBe(PROJECT_NAME);
        expect(project.collectionName).toBe("");
    });

    it("prefixes the path with the collection on-premises", () => {
        const project = new Project("acc1", { guid: PROJECT_GUID, name: PROJECT_NAME }, "Collection2020");

        expect(project.path).toBe("Collection2020/" + PROJECT_NAME);
    });
});

describe("Query model", () => {
    it("has no leading separator in nameInList for cloud accounts", () => {
        const query = makeQuery("acc1", "");

        expect(query.collectionName).toBe("");
        expect(query.nameInList).toBe("MySweetBot / Shared Queries / Assigned to me");
    });

    it("keeps the on-premises nameInList prefixed with the collection", () => {
        const query = makeQuery("acc1", "Collection2020");

        expect(query.nameInList).toBe("Collection2020 / MySweetBot / Shared Queries / Assigned to me");
    });
});

function makePullRequestResponse() {
    return {
        pullRequestId: 42,
        createdBy: {
            id: "aad.user-id",
            displayName: "John Smith",
            uniqueName: "john@example.com",
            imageUrl: "avatar.png",
            descriptor: "aad.author-descriptor",
        },
        creationDate: "2026-01-01T10:00:00Z",
        isDraft: false,
        repository: { id: "repo1", name: "repo", project: { id: "p1", name: "proj" } },
        title: "PR title",
        url: "https://tfs/tfs/Collection2020/proj/_apis/git/repositories/repo/pullRequests/42",
        status: "active",
        reviewers: [
            {
                displayName: "Jane Doe",
                uniqueName: "jane@example.com",
                imageUrl: "jane.png",
                isRequired: true,
                vote: 10,
                id: "r1",
            },
        ],
        targetRefName: "refs/heads/main",
        sourceRefName: "refs/heads/feature/x",
        labels: [{ name: "bug" }],
        mergeStatus: "succeeded" as const,
        lastMergeSourceCommit: { commitId: "c0ffee", url: "u" },
    };
}

function makeConnectionData(overrides?: {
    deploymentType?: string;
    authenticatedUser?: Partial<IConnectionData["authenticatedUser"]>;
}): IConnectionData {
    return {
        authenticatedUser: {
            id: "aad.user-id",
            subjectDescriptor: "aad.author-descriptor",
            providerDisplayName: "John Smith",
            isActive: true,
            properties: {},
            ...overrides?.authenticatedUser,
        },
        deploymentType: overrides?.deploymentType,
    } as IConnectionData;
}

describe("PullRequest model", () => {
    it("maps the response fields and rewrites the url to a browser form", () => {
        mockedGetConnectionData.mockReturnValue(undefined);

        const pr = new PullRequest(makePullRequestResponse() as any, "Collection2020", "acc1", 3);

        expect(pr.id).toBe(42);
        expect(pr.authorFullName).toBe("John Smith <john@example.com>");
        expect(pr.authorName).toBe("John S.");
        //the identity id is the stable author match on Azure DevOps Services
        expect(pr.authorId).toBe("aad.user-id");
        expect(pr.authorDescriptor).toBe("aad.author-descriptor");
        expect(pr.title).toBe("PR title");
        expect(pr.collectionName).toBe("Collection2020");
        expect(pr.projectName).toBe("proj");
        expect(pr.sourceBranch).toBe("feature/x");
        expect(pr.targetBranch).toBe("main");
        expect(pr.labels).toEqual([{ name: "bug" }]);
        expect(pr.newThreadsCount).toBe(3);
        expect(pr.commitId).toBe("c0ffee");
        expect(pr.url).toBe("https://tfs/tfs/Collection2020/proj/_git/repo/pullrequest/42");
    });

    it("detects authorship via the subject descriptor (on-premises)", () => {
        mockedGetConnectionData.mockReturnValue(makeConnectionData());

        const pr = new PullRequest(makePullRequestResponse() as any, "Collection2020", "acc1", 0);

        expect(pr.getBelonging()).toBe("author");
    });

    it("detects authorship via the identity id on cloud (hosted) accounts", () => {
        //on ADO Services the identity descriptor differs from the subject descriptor
        mockedGetConnectionData.mockReturnValue(
            makeConnectionData({
                deploymentType: "hosted",
                authenticatedUser: {
                    subjectDescriptor: "aad.subject-descriptor",
                    providerDisplayName: "Someone Else",
                },
            })
        );

        const pr = new PullRequest(makePullRequestResponse() as any, "", "acc1", 0);

        expect(pr.getBelonging()).toBe("author");
    });

    it("detects the reviewer by display name", () => {
        mockedGetConnectionData.mockReturnValue(
            makeConnectionData({
                deploymentType: "hosted",
                authenticatedUser: {
                    subjectDescriptor: "aad.subject-descriptor",
                    id: "aad.other-id",
                    providerDisplayName: "Jane Doe",
                },
            })
        );

        const pr = new PullRequest(makePullRequestResponse() as any, "Collection2020", "acc1", 0);

        expect(pr.getBelonging()).toBe("reviewer");
    });

    it("detects membership in a review group", () => {
        mockedGetConnectionData.mockReturnValue(
            makeConnectionData({
                authenticatedUser: {
                    subjectDescriptor: "aad.subject-descriptor",
                    id: "aad.other-id",
                    providerDisplayName: "Someone Else",
                    memberOfGroups: ["Team A", "Team B"],
                },
            })
        );

        const resp = makePullRequestResponse();
        resp.reviewers = [
            { displayName: "Team A", uniqueName: "team-a", imageUrl: "", isRequired: false, vote: 0, id: "g1" },
        ];

        const pr = new PullRequest(resp as any, "Collection2020", "acc1", 0);

        expect(pr.getBelonging()).toBe("team");
    });

    it("returns null when there is no connection data", () => {
        mockedGetConnectionData.mockReturnValue(undefined);

        const pr = new PullRequest(makePullRequestResponse() as any, "Collection2020", "acc1", 0);

        expect(pr.getBelonging()).toBeNull();
    });

    it("isAcceptedByMe checks own vote", () => {
        mockedGetConnectionData.mockReturnValue(
            makeConnectionData({ authenticatedUser: { providerDisplayName: "Jane Doe" } as any })
        );

        const pr = new PullRequest(makePullRequestResponse() as any, "Collection2020", "acc1", 0);

        expect(pr.isAcceptedByMe()).toBe(true);
    });
});

describe("model fixtures sanity", () => {
    it("cloud and on-prem query urls used in other tests", () => {
        const cloud = makeQuery("acc1", "");
        const onPrem = makeQuery("acc1", "Collection2020");

        expect(cloud.collectionName).toBe("");
        expect(onPrem.collectionName).toBe("Collection2020");
        expect(cloud.teamId).toBe(PROJECT_GUID);
        expect(onPrem.queryId).toBe("61ebf82e-c6f6-4c69-9a23-082c3ee59ba1");
    });
});
