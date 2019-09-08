import React from "react";
import store from "./store";
import { observer } from "mobx-react";
import Settings from "./helpers/Settings";
import SettingsView from "./views/SettingsView";
import CredentialsView from "./views/CredentialsView";
import SelectQueriesView from "./views/SelectQueriesView";
import ErrorView from "./views/ErrorView";
import MainView from "./views/MainView";
import LoadingView from "./views/LoadingView";
import DebugView from "./views/DebugView";
import Electron from "./helpers/Electron";

@observer
export default class App extends React.Component {
    componentDidMount() {
        Electron.reactIsReady();

        Settings.pullFromWindow();

        Electron.checkForUpdates();

        if (Electron.isDev()) {
            store.view = "debug";
        } else {
            if (store.settings.credentialsChecked) store.view = "main";
            else store.view = "credentials";
        }
    }

    render() {
        switch (store.view) {
            case "loading":
                return <LoadingView />;
            case "error":
                return <ErrorView />;
            case "main":
                return <MainView />;
            case "settings":
                return <SettingsView />;
            case "credentials":
                return <CredentialsView />;
            case "selectqueries":
                return <SelectQueriesView />;
            case "debug":
                return <DebugView />;
            default:
                return <MainView />;
        }
    }
}
