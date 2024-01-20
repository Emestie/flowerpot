import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "semantic-ui-css/semantic.min.css";
import { App } from "./components/App";
import ErrorBoundary from "./components/ErrorBoundary";
import { UnauthorizedAccess } from "./components/UnauthorizedAccess";
import "./debug-fns";
import Platform, { PlatformType } from "./helpers/Platform";
import { store } from "./redux/store";
import "./style/style-dark-override.scss";
import "./style/style.scss";

let appComponent = null;

if (Platform.type !== PlatformType.Electron) appComponent = <UnauthorizedAccess />;
else appComponent = <App />;

ReactDOM.render(
    <Provider store={store}>
        <ErrorBoundary>{appComponent}</ErrorBoundary>
    </Provider>,
    document.getElementById("root")
);
