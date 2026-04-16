import { useCallback, useEffect } from "react";
import { Button, Container, Message } from "semantic-ui-react";
import { PageLayout } from "../components/PageLayout";
import { ViewHeading } from "../components/heading/ViewHeading";
import Platform from "../helpers/Platform";
import { Timers } from "../helpers/Timers";
import { s } from "../values/Strings";
import { useAppStore } from "../zustand/app";

export interface IErrorViewParams extends Record<string, any> {
    errorMessage: string;
}

export function ErrorView() {
    const viewParams = useAppStore((state) => state.viewParams) as IErrorViewParams;

    const errorMessage = viewParams.errorMessage;

    const routineStop = useCallback(() => {
        Timers.delete("error-interval");
    }, []);

    const onRefreshClick = useCallback(() => {
        routineStop();
        useAppStore.getState().setView("main");
    }, [routineStop]);

    const routineStart = useCallback(() => {
        Timers.delete("error-interval");
        Timers.create("error-interval", 60000, () => {
            if (useAppStore.getState().view === "error") onRefreshClick();
        });
    }, [onRefreshClick]);

    const onSettingsClick = () => {
        routineStop();
        useAppStore.getState().setView("credentials");
    };

    useEffect(() => {
        routineStart();
        Platform.current.updateTrayIcon(0, false);

        return () => {
            Timers.delete("error-interval");
        };
    }, [routineStart]);

    return (
        <PageLayout heading={<ViewHeading />}>
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
                    <div style={{ marginTop: 10 }}>
                        {s("errorDesc3")}{" "}
                        <Button size="tiny" compact onClick={onSettingsClick}>
                            {s("tfsSettings")}
                        </Button>{" "}
                        {s("errorDesc4")}
                    </div>
                </div>
            </Container>
        </PageLayout>
    );
}
