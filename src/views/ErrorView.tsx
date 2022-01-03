import React, { useCallback, useEffect } from "react";
import { Button, Container, Message } from "semantic-ui-react";
import { s } from "../values/Strings";
import { ViewHeading } from "../components/heading/ViewHeading";
import { useDispatch, useSelector } from "react-redux";
import { appSelector } from "../redux/selectors/appSelectors";
import { appViewSet } from "../redux/actions/appActions";
import { Timers } from "../helpers/Timers";
import Platform from "../helpers/Platform";
import { IAppState } from "../redux/reducers/appReducer";

export interface IErrorViewParams extends Record<string, any> {
    errorMessage: string;
}

export function ErrorView() {
    const { viewParams } = useSelector(appSelector) as IAppState<IErrorViewParams>;
    const dispatch = useDispatch();

    const errorMessage = viewParams.errorMessage;

    const routineStop = useCallback(() => {
        Timers.delete("error-interval");
    }, []);

    const onRefreshClick = useCallback(() => {
        routineStop();
        dispatch(appViewSet("main"));
    }, [dispatch, routineStop]);

    const routineStart = useCallback(() => {
        Timers.delete("error-interval");
        Timers.create("error-interval", 60000, () => {
            onRefreshClick();
        });
    }, [onRefreshClick]);

    const onSettingsClick = () => {
        routineStop();
        dispatch(appViewSet("credentials"));
    };

    useEffect(() => {
        routineStart();
        Platform.current.updateTrayIcon(0, false);
    }, [routineStart]);

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
