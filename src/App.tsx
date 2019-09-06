import React from "react";
import store from "./store";
import { observer } from "mobx-react";
import Settings from "./helpers/Settings";
import SettingsView from "./views/SettingsView";
import CredentialsView from "./views/CredentialsView";
import SelectQueriesView from "./views/SelectQueriesView";

@observer
export default class App extends React.Component {
    componentDidMount() {
        Settings.pullFromWindow();
        // if (store.settings.credentialsChecked) store.view = "main";
        // else store.view = "credentials";
        store.view = "selectqueries";
    }

    render() {
        switch (store.view) {
            case "loading":
                return <SettingsView />;
            case "error":
                return <SettingsView />;
            case "main":
                return <SettingsView />;
            case "settings":
                return <SettingsView />;
            case "credentials":
                return <CredentialsView />;
            case "selectqueries":
                return <SelectQueriesView />;
        }
    }
}
