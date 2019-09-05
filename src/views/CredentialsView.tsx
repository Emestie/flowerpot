import React from "react";
import { Header, Container, Button, Form, Input, DropdownProps, DropdownItemProps, Label } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";

interface IProps {}
interface IState {
    pathInvalid: boolean;
    userInvalid: boolean;
    pwdInvalid: boolean;
    credentialsCheckStatus: number;
}

@observer
export default class CredentialsView extends React.Component<IProps, IState> {
    state: IState = {
        pathInvalid: false,
        userInvalid: false,
        pwdInvalid: false,
        credentialsCheckStatus: 0
    };

    statuses = [
        { color: undefined, text: "Not checked yet" },
        { color: undefined, text: "Checking..." },
        { color: "red", text: "Wrong" },
        { color: "olive", text: "OK" }
    ];

    componentDidMount() {
        this.validateTfsUser(store.settings.tfsUser, true);
        this.validateTfsPath(store.settings.tfsPath, true);
        this.validateTfsPwd(store.settings.tfsPwd, true);
    }

    get isBackUnavailable() {
        return this.state.pathInvalid || this.state.userInvalid || this.state.pwdInvalid || this.state.credentialsCheckStatus != 3;
    }

    get isCheckUnabailable() {
        return (
            this.state.pathInvalid ||
            this.state.userInvalid ||
            this.state.pwdInvalid ||
            this.checkInProgress ||
            this.state.credentialsCheckStatus == 3
        );
    }

    get statusParams() {
        return this.statuses[this.state.credentialsCheckStatus];
    }

    get checkInProgress() {
        return this.state.credentialsCheckStatus == 1;
    }

    validateTfsPath = (val: string, ignoreStore?: boolean) => {
        //start with http and end with /
        if (!ignoreStore) store.settings.tfsPath = val;

        let invalid = false;
        if (val[val.length - 1] !== "/") invalid = true;
        if (val.indexOf("http") !== 0) invalid = true;
        if (val.indexOf("://") !== 0) invalid = true;
        if (val.length < 11) invalid = true;
        this.setState({ pathInvalid: invalid });
    };

    validateTfsUser = (val: string, ignoreStore?: boolean) => {
        if (!ignoreStore) store.settings.tfsUser = val;

        let invalid = false;
        if (!val.length) invalid = true;
        if (val.indexOf("\\") !== -1 || val.indexOf("@") !== -1) invalid = true;

        this.setState({ userInvalid: invalid });
    };

    validateTfsPwd = (val: string, ignoreStore?: boolean) => {
        if (!ignoreStore) store.settings.tfsPwd = val;
    };

    onSave = () => {
        store.switchView("settings");
    };

    onTest = () => {
        let s = JSON.stringify(store);
        alert(s);
    };

    onCheck = () => {
        this.setState({ credentialsCheckStatus: 1 });

        //after check status set to 3 mark that creds is valid
        //!if any error set to false
        store.settings.credentialsChecked = true;
    };

    render() {
        return (
            <div className="Page">
                <div className="RightTopCorner">
                    <Button positive disabled={this.isBackUnavailable} onClick={this.onSave}>
                        Save
                    </Button>
                </div>
                <Container fluid>
                    <Header as="h1">TFS & Account settings</Header>

                    <Header as="h3" dividing>
                        Credentials
                    </Header>
                    <Form loading={this.checkInProgress}>
                        <Form.Input
                            fluid
                            label="TFS path with collection name (must start with 'http://' and end with '/')"
                            placeholder="http://tfs.eos.loc:8080/tfs/DefaultCollection/"
                            value={store.settings.tfsPath}
                            onChange={e => this.validateTfsPath(e.target.value)}
                            error={this.state.pathInvalid}
                        />
                        <Form.Group widths="equal">
                            <Form.Input
                                fluid
                                label="TFS username (without domain)"
                                placeholder="user.name"
                                value={store.settings.tfsUser}
                                onChange={e => this.validateTfsUser(e.target.value)}
                                error={this.state.userInvalid}
                            />
                            <Form.Input
                                fluid
                                label="TFS password"
                                type="password"
                                value={store.settings.tfsPwd}
                                onChange={e => this.validateTfsPwd(e.target.value)}
                                error={this.state.pwdInvalid}
                            />
                        </Form.Group>
                    </Form>
                    <div>You must check credentials you entered before leaving this page.</div>
                    <br />
                    <div>
                        Status: <Label color={this.statusParams.color as any}>{this.statusParams.text}</Label>
                    </div>
                    <br />
                    <Button primary loading={this.checkInProgress} disabled={this.isCheckUnabailable} onClick={this.onCheck}>
                        Check
                    </Button>
                    {/* <Button onClick={this.onTest}>test</Button> */}
                </Container>
            </div>
        );
    }
}
