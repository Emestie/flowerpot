import { describe, expect, it } from "vitest";
import CloudAdo from "../helpers/CloudAdo";

describe("CloudAdo.getOrgName", () => {
    it("extracts the org from a {org}.visualstudio.com url", () => {
        expect(CloudAdo.getOrgName("https://mstpwnz.visualstudio.com/")).toBe("mstpwnz");
        expect(CloudAdo.getOrgName("https://mstpwnz.visualstudio.com/MySweetBot/_queries/query/x")).toBe("mstpwnz");
        expect(CloudAdo.getOrgName("https://mstpwnz.visualstudio.com")).toBe("mstpwnz");
    });

    it("extracts the org from the dev.azure.com entry point", () => {
        expect(CloudAdo.getOrgName("https://dev.azure.com/mstpwnz/")).toBe("mstpwnz");
        expect(CloudAdo.getOrgName("https://dev.azure.com/mstpwnz/MySweetBot/_workitems/edit/5")).toBe("mstpwnz");
    });

    it("handles the {org}.vssps.visualstudio.com service host", () => {
        expect(CloudAdo.getOrgName("https://mstpwnz.vssps.visualstudio.com/")).toBe("mstpwnz");
    });

    it("is case-insensitive on the host", () => {
        expect(CloudAdo.getOrgName("https://MSTPWNZ.VISUALSTUDIO.COM/")).toBe("mstpwnz");
        expect(CloudAdo.getOrgName("https://Dev.Azure.Com/mstpwnz")).toBe("mstpwnz");
    });

    it("returns an empty string for on-premises urls", () => {
        expect(CloudAdo.getOrgName("https://msktfs.eos.ru:8443/tfs/Collection2020/")).toBe("");
        expect(CloudAdo.getOrgName("http://tfs:8080/tfs/")).toBe("");
    });

    it("returns an empty string for edge cases", () => {
        expect(CloudAdo.getOrgName("https://dev.azure.com/")).toBe("");
        expect(CloudAdo.getOrgName("not a url")).toBe("");
        expect(CloudAdo.getOrgName("")).toBe("");
    });
});

describe("CloudAdo.isCloudUrl", () => {
    it("detects cloud urls", () => {
        expect(CloudAdo.isCloudUrl("https://mstpwnz.visualstudio.com/")).toBe(true);
        expect(CloudAdo.isCloudUrl("https://dev.azure.com/mstpwnz")).toBe(true);
    });

    it("rejects on-premises and garbage urls", () => {
        expect(CloudAdo.isCloudUrl("https://msktfs.eos.ru:8443/tfs/Collection2020/")).toBe(false);
        expect(CloudAdo.isCloudUrl("")).toBe(false);
    });
});

describe("CloudAdo.canonicalizeUrl", () => {
    it("converts a dev.azure.com url to the {org}.visualstudio.com form", () => {
        expect(CloudAdo.canonicalizeUrl("https://dev.azure.com/mstpwnz")).toBe("https://mstpwnz.visualstudio.com/");
        expect(CloudAdo.canonicalizeUrl("https://dev.azure.com/mstpwnz/proj/_workitems/edit/5")).toBe(
            "https://mstpwnz.visualstudio.com/"
        );
    });

    it("strips everything after the org on the visualstudio.com host", () => {
        expect(CloudAdo.canonicalizeUrl("https://mstpwnz.visualstudio.com/MySweetBot/_queries/query/abc")).toBe(
            "https://mstpwnz.visualstudio.com/"
        );
    });

    it("returns on-premises urls as-is", () => {
        const onPrem = "https://msktfs.eos.ru:8443/tfs/Collection2020/";
        expect(CloudAdo.canonicalizeUrl(onPrem)).toBe(onPrem);
    });
});

describe("CloudAdo.getVsspsUrl", () => {
    it("routes cloud urls to the vssps service host", () => {
        expect(CloudAdo.getVsspsUrl("https://mstpwnz.visualstudio.com/")).toBe(
            "https://mstpwnz.vssps.visualstudio.com/"
        );
        expect(CloudAdo.getVsspsUrl("https://dev.azure.com/mstpwnz/")).toBe("https://mstpwnz.vssps.visualstudio.com/");
    });

    it("returns on-premises urls unchanged", () => {
        const onPrem = "https://msktfs.eos.ru:8443/tfs/Collection2020/";
        expect(CloudAdo.getVsspsUrl(onPrem)).toBe(onPrem);
    });
});

describe("CloudAdo.getCollectionDisplayName", () => {
    it("prefers a real collection name", () => {
        expect(CloudAdo.getCollectionDisplayName("https://x/tfs/", "Collection2020")).toBe("Collection2020");
        expect(CloudAdo.getCollectionDisplayName("https://mstpwnz.visualstudio.com/", "SomeName")).toBe("SomeName");
    });

    it("falls back to the org name for cloud accounts with an empty collection", () => {
        expect(CloudAdo.getCollectionDisplayName("https://mstpwnz.visualstudio.com/", "")).toBe("mstpwnz");
        expect(CloudAdo.getCollectionDisplayName("https://dev.azure.com/mstpwnz", "")).toBe("mstpwnz");
    });

    it("returns an empty string when there is nothing to display", () => {
        expect(CloudAdo.getCollectionDisplayName(undefined, undefined)).toBe("");
        expect(CloudAdo.getCollectionDisplayName(undefined, "")).toBe("");
        expect(CloudAdo.getCollectionDisplayName("https://tfs/tfs/", undefined)).toBe("");
    });
});
