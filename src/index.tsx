import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "semantic-ui-css/semantic.min.css";
import { App } from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./debug-fns";
import { store } from "./redux/store";
import "./style/style-dark-override.scss";
import "./style/style.scss";

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </Provider>
);
