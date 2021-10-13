import React, { useEffect } from "react";
import { Button, Container, Message } from "semantic-ui-react";
import { s } from "../values/Strings";
import { ViewHeading } from "../components/heading/ViewHeading";
import { useDispatch, useSelector } from "react-redux";
import { appSelector } from "../redux/selectors/appSelectors";
import { appViewSet } from "../redux/actions/appActions";

//TODO: было в сторе
let errorInterval: any = undefined;

export function ErrorView() {
    const { errorMessage } = useSelector(appSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        routineStart();
    }, []);

    const routineStart = () => {
        if (errorInterval) {
            clearInterval(errorInterval);
            errorInterval = undefined;
        }

        errorInterval = setInterval(() => {
            onRefreshClick();
        }, 60000);
    };

    const onSettingsClick = () => {
        dispatch(appViewSet("credentials"));
    };

    const onRefreshClick = () => {
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
