import React from "react";
import { Header, Button, Container, Message } from "semantic-ui-react";
import store from "../store";
import { s } from "../values/Strings";
import { observer } from "mobx-react";
import ViewHeading from "../components/ViewHeading";

interface IProps {}
interface IState {}

@observer
export default class ErrorView extends React.Component<IProps, IState> {
    componentDidMount() {
        this.routineStart();
    }

    routineStart = () => {
        if (store.errorInterval) {
            clearInterval(store.errorInterval);
            store.errorInterval = undefined;
        }

        store.errorInterval = setInterval(() => {
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
                <ViewHeading />
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
