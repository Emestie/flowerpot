import { useEffect, useRef } from "react";
import { useAppStore } from "../../zustand/app";
import { Sections, useSettingsStore } from "../../zustand/settings";
import { TView } from "../../types";

export interface IHashRoute {
    view: TView;
    params: Record<string, string>;
    settingsSection?: Sections;
}

const validViews: TView[] = [
    "loading",
    "error",
    "main",
    "settings",
    "credentials",
    "selectqueries",
    "selectprojects",
    "debug",
    "refreshhelper",
    "info",
];

const sectionToUrlName = (section: Sections): string =>
    Sections[section].toLowerCase();

const urlNameToSection = (name: string): Sections | undefined => {
    const key = Object.keys(Sections).find(
        (k) => k.toLowerCase() === name
    ) as keyof typeof Sections | undefined;
    return key != null ? Sections[key] : undefined;
};

export function parseHash(hash?: string): IHashRoute | null {
    const h = hash ?? window.location.hash;
    if (!h || h === "#") return null;

    const withoutHash = h.startsWith("#") ? h.slice(1) : h;
    const trimmed = withoutHash.startsWith("/") ? withoutHash.slice(1) : withoutHash;
    const [viewPart, searchPart] = trimmed.split("?");

    if (!validViews.includes(viewPart as TView)) return null;

    const params: Record<string, string> = {};
    if (searchPart) {
        new URLSearchParams(searchPart).forEach((value, key) => {
            params[key] = value;
        });
    }

    const sectionName = params["section"]?.toLowerCase();
    const settingsSection =
        viewPart === "settings" && sectionName ? urlNameToSection(sectionName) : undefined;

    return { view: viewPart as TView, params, settingsSection };
}

export function buildHash(
    view: TView,
    params?: Record<string, any>,
    settingsSection?: Sections
): string {
    const sp = new URLSearchParams();
    if (view === "settings" && settingsSection != null) {
        sp.set("section", sectionToUrlName(settingsSection));
    }
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v != null && k !== "section") sp.set(k, String(v));
        }
    }
    const s = sp.toString();
    return s ? `#/${view}?${s}` : `#/${view}`;
}

export function HashRouterProvider({ children }: { children: React.ReactNode }) {
    const view = useAppStore((s) => s.view);
    const viewParams = useAppStore((s) => s.viewParams);
    const settingsSection = useSettingsStore((s) => s.settingsSection);

    const initialSyncDone = useRef(false);
    const prevView = useRef(view);

    useEffect(() => {
        const syncToStore = () => {
            const route = parseHash();
            if (route) {
                useAppStore.getState().setView(route.view, route.params);
                if (route.settingsSection != null) {
                    useSettingsStore.getState().setSettingsSection(route.settingsSection);
                }
            }
        };

        syncToStore();
        initialSyncDone.current = true;

        window.addEventListener("hashchange", syncToStore);
        window.addEventListener("popstate", syncToStore);
        return () => {
            window.removeEventListener("hashchange", syncToStore);
            window.removeEventListener("popstate", syncToStore);
        };
    }, []);

    useEffect(() => {
        if (!initialSyncDone.current) return;
        if (view === "loading") return;
        const hash = buildHash(view, viewParams, settingsSection);
        if (window.location.hash !== hash) {
            if (view !== prevView.current) {
                window.history.pushState(null, "", hash);
            } else {
                window.history.replaceState(null, "", hash);
            }
        }
        prevView.current = view;
    }, [view, viewParams, settingsSection]);

    return <>{children}</>;
}
