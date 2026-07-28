import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./debug-fns";
import "./style/ui.css";
import "./style/ui-dark.css";
import "./style/schemes/flexoki.css";

let remountKey = 0;
const render = () => {
    createRoot(document.getElementById("root")!).render(
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
