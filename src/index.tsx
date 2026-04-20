import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import "semantic-ui-css/semantic.min.css";
import { App } from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./debug-fns";
import "./style/style-dark-override.scss";
import "./style/style.scss";

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
