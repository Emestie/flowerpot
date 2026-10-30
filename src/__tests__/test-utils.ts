import { vi } from "vitest";
import { Project } from "../models/project";
import { Query } from "../models/query";
import { WorkItem } from "../models/work-item";
import type { IAccount } from "../helpers/Settings";
import { useAppStore } from "../zustand/app";
import { useCredentialsModeStore } from "../zustand/credentials-mode";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";

/** Live org / collection / project / query data used across the fixtures. */
export const CLOUD_URL = "https://mstpwnz.visualstudio.com/";
//on-premises account urls point at the application root, the collection name
//is a separate segment the loaders and deep links append themselves
export const ON_PREM_URL = "https://msktfs.eos.ru:8443/tfs/";
export const ON_PREM_BASE = ON_PREM_URL;
export const PROJECT_GUID = "8f80a23f-25d3-4911-a5d0-00454c8622eb";
export const PROJECT_NAME = "MySweetBot";
export const QUERY_ID = "61ebf82e-c6f6-4c69-9a23-082c3ee59ba1";

export interface IFakeResponse {
    status: number;
    ok: boolean;
    headers: Headers;
    json: () => Promise<any>;
}

/** Minimal fetch Response double: status + content-type + a JSON body. */
export function makeJsonResponse(body: unknown, options?: { status?: number; contentType?: string }): IFakeResponse {
    const status = options?.status ?? 200;
    return {
        status,
        ok: status >= 200 && status < 300,
        headers: new Headers({ "content-type": options?.contentType ?? "application/json" }),
        json: () => Promise.resolve(body),
    };
}

export interface IFetchCall {
    url: string;
    init: RequestInit | undefined;
}

export type TFetchResponder = (url: string, init: RequestInit | undefined) => IFakeResponse;

/**
 * Replaces global fetch with a responder function and records every call.
 * Returns the recorded calls; the stub is released by vi.unstubAllGlobals().
 */
export function stubFetch(responder: TFetchResponder): IFetchCall[] {
    const calls: IFetchCall[] = [];

    const fetchMock = vi.fn(async (url: any, init?: any) => {
        calls.push({ url: String(url), init });
        return responder(String(url), init);
    });

    vi.stubGlobal("fetch", fetchMock);

    return calls;
}

/** Responder matching exact URLs (first match wins), with an optional fallback. */
export function respondByExactUrl(responses: Record<string, unknown>, fallback?: TFetchResponder): TFetchResponder {
    return (url, init) => {
        for (const [key, body] of Object.entries(responses)) {
            if (url === key) return makeJsonResponse(body);
        }
        if (fallback) return fallback(url, init);
        return makeJsonResponse({}, { status: 500 });
    };
}

export function makeAccount(url: string, id: string, descriptor?: string): IAccount {
    return {
        id,
        url,
        token: "t".repeat(50),
        displayName: "Test User",
        descriptor,
        badge: 1,
    };
}

/** A real Query built from real models, with overridable ids/paths. */
export function makeQuery(
    accountId: string,
    collectionName: string,
    options?: { teamName?: string; guid?: string; queryId?: string; queryName?: string; queryPath?: string }
): Query {
    const project = new Project(
        accountId,
        { guid: options?.guid ?? PROJECT_GUID, name: options?.teamName ?? PROJECT_NAME },
        collectionName
    );

    return new Query(
        accountId,
        {
            id: options?.queryId ?? QUERY_ID,
            isFolder: false,
            isPublic: true,
            name: options?.queryName ?? "Assigned to me",
            path: options?.queryPath ?? "Shared Queries/Assigned to me",
        },
        project
    );
}

/** A real WorkItem with the minimum fields the model reads. */
export function makeWorkItem(query: Query, options?: { id?: number; htmlUrl?: string; priority?: number }): WorkItem {
    return new WorkItem(
        {
            id: options?.id ?? 1,
            rev: 2,
            url: "",
            _links: {
                html: { href: options?.htmlUrl ?? "" },
            },
            fields: {
                "System.Title": "Test work item",
                "System.State": "New",
                "System.WorkItemType": "User Story",
                "System.CreatedDate": "2026-01-01T10:00:00Z",
                ...(options?.priority === undefined
                    ? {}
                    : { "Microsoft.VSTS.Common.Priority": String(options.priority) }),
            } as any,
        } as any,
        query,
        undefined
    );
}

/** jsdom has no matchMedia — neutral stub, desktop layout. */
export function stubMatchMedia() {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}

/** Resets every zustand store to its defaults so tests don't leak state. */
export function resetStores() {
    useAppStore.setState({ locale: "en", view: "workitems", dialogs: {} });
    useSettingsStore.setState({
        accounts: [],
        queries: [],
        projects: [],
        lists: {
            permawatch: [],
            favorites: [],
            deferred: [],
            hidden: [],
            keywords: [],
            pinned: [],
            forwarded: [],
        },
        openByIdLastAccountId: undefined,
        openByIdLastCollection: undefined,
    });
    useDataStore.setState({ workItems: [], changesCollection: {}, prChangesCollection: {} });
    useCredentialsModeStore.setState({ selectedAccoundId: null });
    localStorage.clear();
}

/** Records URLs (and loader options) without touching the network. */
export function fakeLoader(responder: (url: string, options?: any) => unknown) {
    const urls: string[] = [];
    const inits: any[] = [];

    const loader = async (url: string, options?: any): Promise<any> => {
        urls.push(url);
        inits.push(options);

        const result = responder(url, options);

        if (result instanceof Error) throw result;

        return result;
    };

    return { loader, urls, inits };
}
