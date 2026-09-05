import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";
import Platform, { PlatformType } from "./helpers/Platform";
import "./debug-fns";
import "./style/ui.css";
import "./style/ui-dark.css";
import "./style/schemes/flexoki.css";

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
if (Platform.type === PlatformType.Web && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch((err) => {
            console.warn("Service worker registration failed:", err);
        });
    });
}
