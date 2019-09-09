import React from "react";
import { Header, Button, Container, Message } from "semantic-ui-react";
import store from "../store";
import Differences from "../helpers/Differences";

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
                    <Header as="h1">Error :(</Header>
                    <div className="RightTopCorner"></div>
                </div>
                <Container fluid>
                    <Message negative>
                        <Message.Header>Something bad happened!</Message.Header>
                        <p>{store.errorMessage}</p>
                    </Message>
                    <div style={{ textAlign: "center" }}>
                        <div>
                            You can try manually{" "}
                            <Button size="tiny" compact primary onClick={this.onRefreshClick}>
                                Refresh
                            </Button>{" "}
                            page
                        </div>
                        <div>
                            Or go to{" "}
                            <Button size="tiny" compact onClick={this.onSettingsClick}>
                                TFS Settings
                            </Button>{" "}
                            to check your account and server
                        </div>
                    </div>
                </Container>
            </div>
        );
    }
}
