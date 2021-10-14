import React, { useEffect } from "react";
import Settings from "../helpers/Settings";
import Migration from "../helpers/Migration";
import { SettingsView } from "../views/SettingsView";
import { CredentialsView } from "../views/CredentialsView";
import { SelectQueriesView } from "../views/SelectQueriesView";
import { ErrorView } from "../views/ErrorView";
import { MainView } from "../views/MainView";
import { LoadingView } from "../views/LoadingView";
import { DebugView } from "../views/DebugView";
import Platform from "../helpers/Platform";
import Version from "../helpers/Version";
import { ListsView } from "../views/ListsView";
import { RefreshHelperView } from "../views/RefreshHelperView";
import Festival from "../helpers/Festival";
import { DialogsContainer } from "../views/containers/DialogsContainer";
import { useDispatch, useSelector } from "react-redux";
import { appShowWhatsNewSet, appViewSet } from "../redux/actions/appActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { dataChangesCollectionSet } from "../redux/actions/dataActions";
import { TView } from "../redux/types";
import { appSelector } from "../redux/selectors/appSelectors";

export function App() {
    const dispatch = useDispatch();
    const { view } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);

    useEffect(() => {
        Platform.current.reactIsReady();

        Settings.read();
        Migration.perform();
        Festival.findOut();

        Platform.current.checkForUpdates(true);

        if (Platform.current.isDev()) {
            dispatch(appViewSet("debug"));
            //dispatch(appViewSet("main"));
        } else {
            if (settings.credentialsChecked) dispatch(appViewSet("main"));
            else dispatch(appViewSet("credentials"));
        }

        setWIChangesCollection();
        afterUpdateHandler();
    }, []);

    const setWIChangesCollection = () => {
        const ls = localStorage.getItem("WIChangesCollection");
        if (!ls) return;

        dispatch(dataChangesCollectionSet(JSON.parse(ls)));
    };

    function afterUpdateHandler() {
        if (!Platform.current.isDev() && !Platform.current.isLocal() && Version.isChangedLong()) {
            if (settings.showWhatsNewOnUpdate && Version.isChangedShort()) dispatch(appShowWhatsNewSet(true));
            Version.storeInSettings();
        }
    }

    function getScene(view: TView) {
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

    const scene = getScene(view);

    return (
        <div className={settings.darkTheme ? "FlowerpotDarkTheme" : ""}>
            <DialogsContainer />
            {scene}
        </div>
    );
}
