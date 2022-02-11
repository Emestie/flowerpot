import React, { useCallback, useEffect } from "react";
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
import { store } from "../redux/store";
import { Timers } from "../helpers/Timers";
import { InfoView } from "../views/InfoView";
import { SelectProjectsView } from "../views/SelectProjectsView";

export function App() {
    const dispatch = useDispatch();
    const { view } = useSelector(appSelector);
    const settings = useSelector(settingsSelector);

    const setWIChangesCollection = useCallback(() => {
        const ls = localStorage.getItem("WIChangesCollection");
        if (!ls) return;

        dispatch(dataChangesCollectionSet(JSON.parse(ls)));
    }, [dispatch]);

    const afterUpdateHandler = useCallback(() => {
        if (!Platform.current.isDev() && !Platform.current.isLocal() && Version.isChangedLong()) {
            if (settings.showWhatsNewOnUpdate && Version.isChangedShort()) dispatch(appShowWhatsNewSet(true));
            Version.storeInSettings();
        }
        // eslint-disable-next-line
    }, [dispatch]);

    useEffect(() => {
        (async function () {
            Platform.current.initUpdateListeners();
            Platform.current.reactIsReady();

            await Settings.read();
            Migration.perform();
            Timers.create(
                "festival-icons",
                60000 * 60 * 3,
                () => {
                    Festival.findOut();
                },
                true
            );

            Platform.current.checkForUpdates(true);

            setTimeout(() => {
                if (Platform.current.isDev()) {
                    dispatch(appViewSet("debug"));
                    //dispatch(appViewSet("main"));
                } else {
                    if (store.getState().settings.credentialsChecked) dispatch(appViewSet("main"));
                    else dispatch(appViewSet("credentials"));
                }

                setWIChangesCollection();
                afterUpdateHandler();
            }, 250);
        })();
        // eslint-disable-next-line
    }, []);

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
            case "selectprojects":
                return <SelectProjectsView />;
            case "lists":
                return <ListsView />;
            case "refreshhelper":
                return <RefreshHelperView />;
            case "info":
                return <InfoView />;
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
