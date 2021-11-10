import React from "react";
import { Header, Button, Container } from "semantic-ui-react";
import Platform from "../helpers/Platform";
import WorkItem from "../helpers/WorkItem";
import Version from "../helpers/Version";
import { ViewHeading } from "../components/heading/ViewHeading";
import { useDispatch, useSelector } from "react-redux";
import { appViewSet } from "../redux/actions/appActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { dataChangesCollectionItemSet } from "../redux/actions/dataActions";

export function DebugView() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

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
                <Button onClick={() => dispatch(appViewSet("lists"))}>lists</Button>
                <Header as="h3" dividing>
                    Icon levels
                </Header>
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
                <Header as="h3" dividing>
                    More
                </Header>
                <Button onClick={() => setChanges()}>Set changes to WI</Button>
                <div>
                    {Version.long} / {Version.short}
                </div>
            </Container>
        </div>
    );
}
