import React from "react";
import store from "../store";
import { s } from "../values/Strings";
import Platform from "../helpers/Platform";
import { Message, Button } from "semantic-ui-react";
import { observer } from "mobx-react";

interface IProps {}
interface IState {
    updateInstallInProgress: boolean;
}

@observer
export default class UpdateBanner extends React.Component<IProps, IState> {
    state = {
        updateInstallInProgress: false,
    };

    onUpdate = () => {
        this.setState({ updateInstallInProgress: true });
        Platform.updateApp();
    };

    render() {
        if (store.updateStatus === "ready")
            return (
                <Message positive>
                    <Message.Header>{s("updateArrived")}</Message.Header>
                    <p>
                        {s("updateArrivedText1")}{" "}
                        <Button compact positive size="tiny" loading={this.state.updateInstallInProgress} onClick={this.onUpdate}>
                            {s("install")}
                        </Button>{" "}
                        {s("updateArrivedText2")}
                    </p>
                </Message>
            );
        else return null;
    }
}
