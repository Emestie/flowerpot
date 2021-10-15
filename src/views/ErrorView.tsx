import React, { useEffect } from "react";
import { Button, Container, Message } from "semantic-ui-react";
import { s } from "../values/Strings";
import { ViewHeading } from "../components/heading/ViewHeading";
import { useDispatch, useSelector } from "react-redux";
import { appSelector } from "../redux/selectors/appSelectors";
import { appViewSet } from "../redux/actions/appActions";
import { Timers } from "../helpers/Timers";

export function ErrorView() {
    const { errorMessage } = useSelector(appSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        routineStart();
    }, []);

    const routineStart = () => {
        Timers.delete("error-interval");
        Timers.create("error-interval", 60000, () => {
            onRefreshClick();
        });
    };

    const routineStop = () => {
        Timers.delete("error-interval");
    };

    const onSettingsClick = () => {
        routineStop();
        dispatch(appViewSet("credentials"));
    };

    const onRefreshClick = () => {
        routineStop();
        dispatch(appViewSet("main"));
    };

    return (
        <div className="Page">
            <ViewHeading />
            <Container fluid>
                <Message negative>
                    <Message.Header>{s("errorMsg")}</Message.Header>
                    <p>{errorMessage}</p>
                </Message>
                <div style={{ textAlign: "center" }}>
                    <div>
                        {s("errorDesc1")}{" "}
                        <Button size="tiny" compact primary onClick={onRefreshClick}>
                            {s("refresh")}
                        </Button>{" "}
                        {s("errorDesc2")}
                    </div>
                    <div>
                        {s("errorDesc3")}{" "}
                        <Button size="tiny" compact onClick={onSettingsClick}>
                            {s("tfsSettings")}
                        </Button>{" "}
                        {s("errorDesc4")}
                    </div>
                </div>
            </Container>
        </div>
    );
}
