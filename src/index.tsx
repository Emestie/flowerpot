import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import "./style.scss";
import "./style-dark-override.scss";
import App from "./App";
import UnauthorizedAccess from "./UnauthorizedAccess";
import Platform, { PlatformType } from "./helpers/Platform";

let appComponent = null;

if (Platform.type !== PlatformType.Electron) appComponent = <UnauthorizedAccess />;
else appComponent = <App />;

ReactDOM.render(appComponent, document.getElementById("root"));
