import React from "react";
import store, { TView } from "./store";
import { observer } from "mobx-react";
import Settings from "./helpers/Settings";
import Migration from "./helpers/Migration";
import SettingsView from "./views/SettingsView";
import CredentialsView from "./views/CredentialsView";
import SelectQueriesView from "./views/SelectQueriesView";
import ErrorView from "./views/ErrorView";
import MainView from "./views/MainView";
import LoadingView from "./views/LoadingView";
import DebugView from "./views/DebugView";
import Platform from "./helpers/Platform";
import Version from "./helpers/Version";
import ListsView from "./views/ListsView";
import RefreshHelperView from "./views/RefreshHelperView";
import Festival from "./helpers/Festival";
import DialogsContainer from "./views/containers/DialogsContainer";

@observer
export default class App extends React.Component {
    componentDidMount() {
        Platform.current.reactIsReady();

        Settings.read();
        Migration.perform();
        Festival.findOut();

        Platform.current.checkForUpdates(true);

        if (Platform.current.isDev()) {
            store.switchView("debug");
            //store.switchView("main");
        } else {
            if (store.settings.credentialsChecked) store.switchView("main");
            else store.switchView("credentials");
        }

        this.setWIChangesCollection();
        this.afterUpdateHandler();
    }

    setWIChangesCollection() {
        const ls = localStorage.getItem("WIChangesCollection");
        if (!ls) return;

        store._changesCollection = JSON.parse(ls);
    }

    afterUpdateHandler() {
        if (!Platform.current.isDev() && !Platform.current.isLocal() && Version.isChangedLong()) {
            if (store.settings.showWhatsNewOnUpdate && Version.isChangedShort()) store.showWhatsNew = true;
            Version.storeInSettings();
        }
    }

    getScene(view: TView) {
        switch (view) {
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
        const scene = this.getScene(store.view);

        return (
            <div className={store.settings.darkTheme ? "FlowerpotDarkTheme" : ""}>
                <DialogsContainer />
                {scene}
            </div>
        );
    }
}
