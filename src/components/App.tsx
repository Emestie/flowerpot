import { useCallback, useEffect, useState } from "react";
import Festival from "../helpers/Festival";
import Migration from "../helpers/Migration";
import Platform from "../helpers/Platform";
import Settings from "../helpers/Settings";
import { getSystemThemeListener, isDarkTheme } from "../helpers/Theme";
import { Timers } from "../helpers/Timers";
import Version from "../helpers/Version";
import { TView } from "../types";
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
import { useAppStore } from "../zustand/app";
import { useDataStore } from "../zustand/data";
import { useSettingsStore } from "../zustand/settings";

export function App() {
    const view = useAppStore((state) => state.view);
    const setView = useAppStore((state) => state.setView);
    const setShowWhatsNew = useAppStore((state) => state.setShowWhatsNew);
    const theme = useSettingsStore((state) => state.theme);
    const [ready, setIsReady] = useState(false);
    const [isDark, setIsDark] = useState(() => isDarkTheme(theme));

    useEffect(() => {
        setIsDark(isDarkTheme(theme));
    }, [theme]);

    useEffect(() => {
        return getSystemThemeListener((dark) => {
            if (theme === "system") {
                setIsDark(dark);
            }
        });
    }, [theme]);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("FlowerpotDarkTheme");
        } else {
            document.documentElement.classList.remove("FlowerpotDarkTheme");
        }
    }, [isDark]);

    const setChangesCollection = useDataStore((state) => state.setChangesCollection);

    const setWIChangesCollection = useCallback(() => {
        const ls = localStorage.getItem("WIChangesCollection");
        if (!ls) return;

        setChangesCollection(JSON.parse(ls));
    }, [setChangesCollection]);

    const afterUpdateHandler = useCallback(() => {
        if (!Platform.current.isDev() && !Platform.current.isLocal() && Version.isChangedLong()) {
            if (Version.isChangedShort()) setShowWhatsNew(true);
            Version.storeInSettings();
        }
        // eslint-disable-next-line
    }, [setShowWhatsNew]);

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

            Platform.current.checkForUpdates(true);

            setTimeout(() => {
                if (Platform.current.isDev()) {
                    setView("debug");
                } else {
                    setView("main");
                }

                setWIChangesCollection();
                afterUpdateHandler();

                setIsReady(true);
            }, 250);
        })();
        // eslint-disable-next-line
    }, []);

    if (!ready) return <LoadingView />;

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
        <div className={isDark ? "FlowerpotDarkTheme" : ""}>
            <DialogsContainer />
            {scene}
        </div>
    );
}
