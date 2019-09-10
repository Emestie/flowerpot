import React from "react";
import { Header, Button, Container, Message } from "semantic-ui-react";
import store from "../store";
import { s } from "../values/Strings";

interface IProps {}
interface IState {}

export default class ErrorView extends React.Component<IProps, IState> {
    private interval: NodeJS.Timeout | undefined;

    componentDidMount() {
        this.routineStart();
    }

    routineStart = () => {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(() => {
            this.onRefreshClick();
        }, 60000);
    };

    onSettingsClick = () => {
        store.switchView("credentials");
    };

    onRefreshClick = () => {
        store.switchView("main");
    };

    render() {
        return (
            <div className="Page">
                <div className="TopBar">
                    <Header as="h1">{s("errorHeader")}</Header>
                    <div className="RightTopCorner"></div>
                </div>
                <Container fluid>
                    <Message negative>
                        <Message.Header>{s("errorMsg")}</Message.Header>
                        <p>{store.errorMessage}</p>
                    </Message>
                    <div style={{ textAlign: "center" }}>
                        <div>
                            {s("errorDesc1")}{" "}
                            <Button size="tiny" compact primary onClick={this.onRefreshClick}>
                                {s("refresh")}
                            </Button>{" "}
                            {s("errorDesc2")}
                        </div>
                        <div>
                            {s("errorDesc3")}{" "}
                            <Button size="tiny" compact onClick={this.onSettingsClick}>
                                {s("tfsSettings")}
                            </Button>{" "}
                            {s("errorDesc4")}
                        </div>
                    </div>
                </Container>
            </div>
        );
    }
}
