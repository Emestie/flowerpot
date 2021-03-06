import React from "react";
import { Header, Container, Button, Form, Label, Message } from "semantic-ui-react";
import { observer } from "mobx-react";
import store from "../store";
import Loaders from "../helpers/Loaders";
import Platform from "../helpers/Platform";
import { s } from "../values/Strings";
import UpdateBanner from "../components/UpdateBanner";
import ViewHeading from "../components/ViewHeading";
import Telemetry from "../helpers/Telemetry";

interface IProps {}
interface IState {
    pathInvalid: boolean;
    userInvalid: boolean;
    pwdInvalid: boolean;
    pwdNotAscii: boolean;
    credentialsCheckStatus: number;
    debugInputValue: string;
}

enum ECredState {
    NotValidated = 0,
    ValidatingInProgress = 1,
    ServerUnavailable = 2,
    WrongCredentials = 3,
    OK = 4
}

@observer
export default class CredentialsView extends React.Component<IProps, IState> {
    state: IState = {
        pathInvalid: false,
        userInvalid: false,
        pwdInvalid: false,
        pwdNotAscii: false,
        credentialsCheckStatus: ECredState.NotValidated,
        debugInputValue: ""
    };

    statuses = [
        { color: undefined, text: s("credsState1") },
        { color: undefined, text: s("credsState2") },
        { color: "red", text: s("credsState3") },
        { color: "red", text: s("credsState4") },
        { color: "olive", text: s("credsState5") }
    ];

    componentDidMount() {
        this.validateTfsUser(store.settings.tfsUser, true);
        this.validateTfsPath(store.settings.tfsPath, true);
        this.validateTfsPwd(store.settings.tfsPwd, true);
    }

    get isBackUnavailable() {
        return (
            this.state.pathInvalid || this.state.userInvalid || this.state.pwdInvalid || this.state.credentialsCheckStatus !== ECredState.OK
        );
    }

    get isCheckUnabailable() {
        return (
            this.state.pathInvalid ||
            this.state.userInvalid ||
            this.state.pwdInvalid ||
            this.checkInProgress ||
            this.state.credentialsCheckStatus === ECredState.OK
        );
    }

    get statusParams() {
        return this.statuses[this.state.credentialsCheckStatus];
    }

    get checkInProgress() {
        return this.state.credentialsCheckStatus === ECredState.ValidatingInProgress;
    }

    setCredentialsStatus(status: number) {
        store.settings.credentialsChecked = status === ECredState.OK ? true : false;
        this.setState({ credentialsCheckStatus: status });
        store.updateSettings();
    }

    validateTfsPath = (val: string, ignoreStore?: boolean) => {
        this.setCredentialsStatus(ECredState.NotValidated);
        if (!ignoreStore) {
            store.settings.tfsPath = val;
            store.updateSettings();
        }

        let invalid = false;
        if (val[val.length - 1] !== "/") invalid = true;
        if (val.indexOf("http") !== 0) invalid = true;
        if (val.indexOf("://") === -1) invalid = true;
        if (val.length < 11) invalid = true;
        this.setState({ pathInvalid: invalid });
    };

    validateTfsUser = (val: string, ignoreStore?: boolean) => {
        this.setCredentialsStatus(ECredState.NotValidated);
        if (!ignoreStore) {
            store.settings.tfsUser = val;
            store.updateSettings();
        }

        let invalid = false;
        if (!val.length) invalid = true;

        if (val.indexOf("\\") < 1 || val.indexOf("\\") === val.length - 1 || val.indexOf("@") !== -1) invalid = true;

        this.setState({ userInvalid: invalid });
    };

    validateTfsPwd = (val: string, ignoreStore?: boolean) => {
        this.setCredentialsStatus(ECredState.NotValidated);
        if (!ignoreStore) {
            store.settings.tfsPwd = val;
            store.updateSettings();
        }

        //if val has cyrillic characters show notif
        var ascii = /^[ -~]+$/;
        if (!ascii.test(val)) {
            this.setState({ pwdNotAscii: true, pwdInvalid: true });
        } else {
            this.setState({ pwdNotAscii: false, pwdInvalid: false });
        }
    };

    onSave = () => {
        store.switchView("settings");
    };

    onTest = () => {
        store.switchView("settings");
    };

    onCheck = async () => {
        this.setCredentialsStatus(ECredState.ValidatingInProgress);

        let tfscheck = await Loaders.checkTfsPath();
        if (!tfscheck) {
            this.setCredentialsStatus(ECredState.ServerUnavailable);
            return;
        }

        let result = await Loaders.checkCredentials();
        if (!result) {
            this.setCredentialsStatus(ECredState.WrongCredentials);
        } else {
            Telemetry.accountVerificationSucceed();
            this.setCredentialsStatus(ECredState.OK);
        }
    };

    onDebugInputChange = (e: any) => {
        if (e.target.value === "debug") store.switchView("debug");
        if (e.target.value === "con") Platform.current.toggleConsole();
        this.setState({ debugInputValue: e.target.value });
    };

    render() {
        let debugInputRef = React.createRef();

        return (
            <div className="Page">
                <ViewHeading>
                    <Button positive disabled={this.isBackUnavailable} onClick={this.onSave}>
                        {s("save")}
                    </Button>
                </ViewHeading>
                <Container fluid>
                    <Header as="h3" dividing>
                        {s("credsHeader")}
                    </Header>
                    <UpdateBanner />
                    <Form loading={this.checkInProgress}>
                        <Form.Input
                            fluid
                            label={s("tfsPath")}
                            placeholder="http://tfs:8080/tfs/"
                            value={store.settings.tfsPath}
                            onChange={e => this.validateTfsPath(e.target.value)}
                            error={this.state.pathInvalid}
                        />
                        <Form.Group widths="equal">
                            <Form.Input
                                fluid
                                label={s("tfsUser")}
                                placeholder="domain\user.name"
                                value={store.settings.tfsUser}
                                onChange={e => this.validateTfsUser(e.target.value)}
                                error={this.state.userInvalid}
                            />
                            <Form.Input
                                fluid
                                label={s("tfsPwd")}
                                type="password"
                                value={store.settings.tfsPwd}
                                onChange={e => this.validateTfsPwd(e.target.value)}
                                error={this.state.pwdInvalid}
                            />
                        </Form.Group>
                        {!!this.state.pwdNotAscii && <Message color="red">{s("noAscii")}</Message>}
                    </Form>
                    <div>
                        <br />
                        <Label color="orange">
                            <span onDoubleClick={() => (debugInputRef.current as any).focus()}>{s("note")}</span>
                        </Label>{" "}
                        {s("credsNoteText")}
                    </div>
                    <br />
                    <div>
                        {s("status")}
                        <Label color={this.statusParams.color as any}>{this.statusParams.text}</Label>
                    </div>
                    <br />
                    <Button primary loading={this.checkInProgress} disabled={this.isCheckUnabailable} onClick={this.onCheck}>
                        {s("validate")}
                    </Button>
                    {/* <Button onClick={this.onTest}>test</Button> */}
                </Container>
                <input
                    style={{ opacity: 0 }}
                    ref={debugInputRef as any}
                    type="text"
                    value={this.state.debugInputValue}
                    onChange={this.onDebugInputChange}
                />
            </div>
        );
    }
}
