import { useEffect } from "react";
import { useAppStore } from "../../zustand/app";
import { TView } from "../../types";

export interface IHashRoute {
    view: TView;
    params: Record<string, string>;
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

export function parseHash(hash?: string): IHashRoute | null {
    const h = hash ?? window.location.hash;
    if (!h || h === "#") return null;

    const withoutHash = h.startsWith("#") ? h.slice(1) : h;
    const [viewPart, searchPart] = withoutHash.split("?");

    if (!validViews.includes(viewPart as TView)) return null;

    const params: Record<string, string> = {};
    if (searchPart) {
        new URLSearchParams(searchPart).forEach((value, key) => {
            params[key] = value;
        });
    }

    return { view: viewPart as TView, params };
}

export function buildHash(view: TView, params: Record<string, any> = {}): string {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v != null) sp.set(k, String(v));
    }
    const s = sp.toString();
    return s ? `#/${view}?${s}` : `#/${view}`;
}

export function HashRouterProvider({ children }: { children: React.ReactNode }) {
    const view = useAppStore((s) => s.view);
    const viewParams = useAppStore((s) => s.viewParams);

    useEffect(() => {
        const hash = buildHash(view, viewParams);
        if (window.location.hash !== hash) {
            window.history.replaceState(null, "", hash);
        }
    }, [view, viewParams]);

    useEffect(() => {
        const onHashChange = () => {
            const route = parseHash();
            if (route) {
                useAppStore.getState().setView(route.view, route.params);
            }
        };

        const route = parseHash();
        if (route) {
            useAppStore.getState().setView(route.view, route.params);
        }

        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    }, []);

    return <>{children}</>;
}
