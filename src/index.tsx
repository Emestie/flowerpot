import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";
import Platform, { PlatformType } from "./helpers/Platform";
import "./debug-fns";
import "./style/ui.css";
import "./style/ui-dark.css";
import "./style/schemes/flexoki.css";
import "./style/schemes/shire.css";

let remountKey = 0;
const root = createRoot(document.getElementById("root")!);
const render = () => {
    root.render(
        <StrictMode>
            <ErrorBoundary
                onRemount={() => {
                    remountKey++;
                    render();
                }}
            >
                <App key={remountKey} />
            </ErrorBoundary>
        </StrictMode>
    );
};

render();

//Service worker is web/PWA only: Electron loads over file:// where SW is unsupported.
//A localhost dev/preview server must not be controlled by it either: the worker's
//cache-first handler caches Vite's dev modules and /@vite/client, so a later session
//gets stale modules plus an old HMR token. The websocket handshake then fails (400)
//and the mixed module graph loads two React copies ("Invalid hook call",
//"Cannot read properties of null (reading 'useEffect')"). Workers left behind by
//older builds are removed below together with the caches they filled.
const pwaServiceWorkerAllowed = Platform.type === PlatformType.Web && !Platform.current.isDev();

if (pwaServiceWorkerAllowed && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch((err) => {
            console.warn("Service worker registration failed:", err);
        });
    });
} else if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
            reg.unregister().catch(() => undefined);
        }
    });
    if ("caches" in window) {
        caches
            .keys()
            .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
            .catch(() => undefined);
    }
}
