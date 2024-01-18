import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Header } from "semantic-ui-react";
import { api } from "../api/client";
import { ViewHeading } from "../components/heading/ViewHeading";
import { DynamicContent } from "../helpers/DynamicContent";
import Platform from "../helpers/Platform";
import { Stats, UsageStat } from "../helpers/Stats";
import Telemetry from "../helpers/Telemetry";
import Version from "../helpers/Version";
import WorkItem from "../helpers/WorkItem";
import { appViewSet } from "../redux/actions/appActions";
import { dataChangesCollectionItemSet } from "../redux/actions/dataActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

export function DebugView() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

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
        Platform.current.showNativeNotif({ title: "test1", body: "test2" });
    };

    const setChanges = () => {
        let wi = WorkItem.fish(settings.queries[0]);
        wi.id = 1578;
        dispatch(dataChangesCollectionItemSet(wi, true));
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

    // const handleClick = (e: any, data: any) => {
    //     console.log(data.foo);
    // };

    return (
        <div className="Page">
            <ViewHeading />
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
                <Button onClick={() => dispatch(appViewSet("main"))}>main</Button>
                <Button onClick={() => dispatch(appViewSet("error"))}>error</Button>
                <Button onClick={() => dispatch(appViewSet("loading"))}>loading</Button>
                <Button onClick={() => dispatch(appViewSet("settings"))}>settings</Button>
                <Button onClick={() => dispatch(appViewSet("credentials"))}>credentials</Button>
                <Button onClick={() => dispatch(appViewSet("selectqueries"))}>selectqueries</Button>
                <Button onClick={() => dispatch(appViewSet("selectprojects"))}>selectprojects</Button>
                <Button onClick={() => dispatch(appViewSet("lists"))}>lists</Button>
                <Button onClick={() => dispatch(appViewSet("info", { contentFileName: "test1.md" }))}>info</Button>
                <Button
                    onClick={() => dispatch(appViewSet("info", { viewCaption: "cap", contentFileName: "test2.md" }))}
                >
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
                <Button onClick={() => console.log(api.pullRequest.getByProjects(settings.projects))}>load PR</Button>
                <Button onClick={() => console.log(api.collection.getAll())}>load collections</Button>
                <Button onClick={() => console.log(api.project.getAll())}>load projects</Button>
                <Button onClick={() => console.log(api.query.getAvailable())}>load av queries</Button>
                <Button onClick={() => console.log(api.workItem.getByQuery(settings.queries[0]))}>
                    load wi by query
                </Button>
                <Button onClick={() => console.log(api.connectionData.get())}>conn data</Button>
                <Header as="h3" dividing>
                    More
                </Header>
                <Button onClick={() => setChanges()}>Set changes to WI</Button>
                <Button onClick={() => Stats.increment(UsageStat.Test)}>Test stat: {settings.stats.test || 0}</Button>
                <Button onClick={loadDynamic}>Load DC</Button>
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
        </div>
    );
}
