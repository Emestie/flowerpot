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
import Version from "./helpers/Version";
import ListsView from "./views/ListsView";
import RefreshHelperView from "./views/RefreshHelperView";

@observer
export default class App extends React.Component {
    componentDidMount() {
        Electron.reactIsReady();

        Settings.read();

        Electron.checkForUpdates(true);

        if (Electron.isDev()) {
            store.switchView("debug");
            //store.switchView("main");
        } else {
            if (store.settings.credentialsChecked) store.switchView("main");
            else store.switchView("credentials");
        }

        this.registrator();
        this.afterUpdateHandler();
    }

    registrator() {}

    afterUpdateHandler() {
        if (!Electron.isDev() && !Electron.isLocal() && Version.isChangedLong()) {
            Version.storeInSettings();
            if (store.settings.showWhatsNewOnUpdate && Version.isChangedShort()) store.showWhatsNew = true;
        }
    }

    getScene() {
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
            case "lists":
                return <ListsView />;
            case "refreshhelper":
                return <RefreshHelperView />;
            case "debug":
                return <DebugView />;
            default:
                return <MainView />;
        }
    }

    render() {
        let scene = this.getScene();
        return <div className={store.settings.darkTheme ? "FlowerpotDarkTheme" : ""}>{scene}</div>;
    }
}
