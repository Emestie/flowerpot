import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import "./style.scss";
import "./style-dark-override.scss";
import App from "./App";
import UnauthorizedAccess from "./UnauthorizedAccess";

let appComponent = <div></div>;

if (document.location.href.indexOf("#628") === -1) appComponent = <UnauthorizedAccess />;
else appComponent = <App />;

ReactDOM.render(appComponent, document.getElementById("root"));
