import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import "./style/style.scss";
import "./style/style-dark-override.scss";
import { App } from "./components/App";
import { UnauthorizedAccess } from "./components/UnauthorizedAccess";
import Platform, { PlatformType } from "./helpers/Platform";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./debug-fns";

let appComponent = null;

if (Platform.type !== PlatformType.Electron) appComponent = <UnauthorizedAccess />;
else appComponent = <App />;

ReactDOM.render(<Provider store={store}>{appComponent}</Provider>, document.getElementById("root"));
