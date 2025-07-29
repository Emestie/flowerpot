import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Festival from "../helpers/Festival";
import Migration from "../helpers/Migration";
import Platform from "../helpers/Platform";
import Settings from "../helpers/Settings";
import { Stats, UsageStat } from "../helpers/Stats";
import { Timers } from "../helpers/Timers";
import Version from "../helpers/Version";
import { appShowWhatsNewSet, appViewSet } from "../redux/actions/appActions";
import { dataChangesCollectionSet } from "../redux/actions/dataActions";
import { appSelector } from "../redux/selectors/appSelectors";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { TView } from "../redux/types";
import { CredentialsView } from "../views/CredentialsView";
import { DebugView } from "../views/DebugView";
import { ErrorView } from "../views/ErrorView";
import { InfoView } from "../views/InfoView";
import { LoadingView } from "../views/LoadingView";
import { MainView } from "../views/MainView";
import { RefreshHelperView } from "../views/RefreshHelperView";
import { SelectProjectsView } from "../views/SelectProjectsView";
import { SelectQueriesView } from "../views/SelectQueriesView";
import { SettingsView } from "../views/SettingsView/SettingsView";
import { DialogsContainer } from "../views/containers/DialogsContainer";

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
            if (Version.isChangedShort()) dispatch(appShowWhatsNewSet(true));
            Version.storeInSettings();
        }
        // eslint-disable-next-line
    }, [dispatch]);

    useEffect(() => {
        (async function () {
            Platform.current.initUpdateListeners();
            Platform.current.reactIsReady();

            await Settings.read();
            await Migration.perform();

            Timers.create(
                "festival-icons",
                60000 * 60 * 3,
                () => {
                    Festival.findOut();
                },
                true
            );

            Timers.create(
                "time-spent-stat",
                60000,
                () => {
                    Stats.increment(UsageStat.MinutesSpentInApp);
                },
                false
            );

            Stats.increment(UsageStat.AppStarts);

            Platform.current.checkForUpdates(true);

            setTimeout(() => {
                if (Platform.current.isDev()) {
                    dispatch(appViewSet("debug"));
                    //dispatch(appViewSet("main"));
                } else {
                    dispatch(appViewSet("main"));
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
