import { useState } from "react";
import { Button, Container, Header } from "semantic-ui-react";
import { getApi } from "../api/client";
import { PageLayout } from "../components/PageLayout";
import { ViewHeading } from "../components/heading/ViewHeading";
import { DynamicContent } from "../helpers/DynamicContent";
import Migration from "../helpers/Migration";
import Platform from "../helpers/Platform";
import Telemetry from "../helpers/Telemetry";
import Version from "../helpers/Version";
import { useAppStore } from "../zustand/app";
import { useSettingsStore } from "../zustand/settings";

export function DebugView() {
    const setView = useAppStore((s) => s.setView);
    const accounts = useSettingsStore((state) => state.accounts);
    const projects = useSettingsStore((state) => state.projects);
    const queries = useSettingsStore((state) => state.queries);

    const api = accounts[0] ? getApi(accounts[0]?.id) : undefined;

    const [throwErrorState, setThrowErrorState] = useState(false);

    if (throwErrorState) {
        throw new Error("some render error");
    }

    const changeIconLevel = (level: number, noDot?: boolean) => {
        Platform.current.updateTrayIcon(level, !noDot);
    };

    const showNotif = () => {
        new Notification("title", { body: "body" });
    };

    const showNotifNative = () => {
        Platform.current.showNotification({ title: "test1", body: "test2" });
    };

    const sendAppUsage = () => {
        Telemetry.versionUsageInfo();
    };

    const sendFeedback = () => {
        Telemetry.sendFeedback("лалала фидбек");
    };

    const loadDynamic = () => {
        DynamicContent.loadFestivalJson();
    };

    return (
        <PageLayout heading={<ViewHeading />}>
            <Container fluid>
                <Header as="h3" dividing>
                    Electron
                </Header>
                <Button onClick={() => Platform.current.toggleConsole()}>console</Button>
                <Button
                    onClick={() => {
                        window.location.href = "http://localhost:5009";
                    }}
                >
                    go to localhost:5009
                </Button>
                <Header as="h3" dividing>
                    Views
                </Header>
                <Button onClick={() => setView("main")}>main</Button>
                <Button onClick={() => setView("error")}>error</Button>
                <Button onClick={() => setView("loading")}>loading</Button>
                <Button onClick={() => setView("settings")}>settings</Button>
                <Button onClick={() => setView("credentials")}>credentials</Button>
                <Button onClick={() => setView("selectqueries")}>selectqueries</Button>
                <Button onClick={() => setView("selectprojects")}>selectprojects</Button>
                <Button onClick={() => setView("info", { contentFileName: "test1.md" })}>info</Button>
                <Button onClick={() => setView("info", { viewCaption: "cap", contentFileName: "test2.md" })}>
                    info2
                </Button>
                <Header as="h3" dividing>
                    Icon levels
                </Header>
                <Button onClick={() => changeIconLevel(0)}>0</Button>
                <Button onClick={() => changeIconLevel(1)}>1</Button>
                <Button onClick={() => changeIconLevel(2)}>2</Button>
                <Button onClick={() => changeIconLevel(3)}>3</Button>
                <Button onClick={() => changeIconLevel(4)}>4</Button>
                <Button onClick={() => changeIconLevel(4, true)}>4 no dot</Button>
                <Header as="h3" dividing>
                    Notifs
                </Header>
                <Button onClick={() => showNotif()}>Show html5</Button>
                <Button onClick={() => showNotifNative()}>Show native electron</Button>
                <Button onClick={() => sendAppUsage()}>Send app usage</Button>
                <Button onClick={() => sendFeedback()}>Send feedback</Button>
                <Header as="h3" dividing>
                    New API
                </Header>
                <Button onClick={() => console.log(api?.pullRequest.getByProjects(projects))}>load PR</Button>
                <Button onClick={() => console.log(api?.collection.getAll())}>load collections</Button>
                <Button onClick={() => console.log(api?.project.getAll())}>load projects</Button>
                <Button onClick={() => console.log(api?.query.getAvailable())}>load av queries</Button>
                <Button onClick={() => console.log(api?.workItem.getByQuery(queries[0]))}>
                    load wi by query
                </Button>
                <Button onClick={() => console.log(api?.connectionData.get())}>conn data</Button>
                <Header as="h3" dividing>
                    More
                </Header>
                <Button onClick={loadDynamic}>Load DC</Button>
                <Button onClick={() => Migration.perform()}>Perform migrations</Button>
                <Button
                    onClick={() => {
                        setThrowErrorState(true);
                    }}
                >
                    Throw error
                </Button>
                <div>
                    {Version.long} / {Version.short}
                </div>
            </Container>
        </PageLayout>
    );
}
