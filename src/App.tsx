import React from "react";
import store from "./store";
import { observer } from "mobx-react";
import SettingsView from "./views/SettingsView";
import CredentialsView from "./views/CredentialsView";
import Settings from "./helpers/Settings";

@observer
export default class App extends React.Component {
    componentDidMount() {
        Settings.pullFromWindow();
        // if (store.settings.credentialsChecked) store.view = "main";
        // else store.view = "credentials";
        store.view = "settings";
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
        }
    }
}
