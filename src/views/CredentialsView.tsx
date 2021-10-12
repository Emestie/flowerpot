import React, { useEffect, useState } from "react";
import { Header, Container, Button, Form, Label, Message } from "semantic-ui-react";
import Loaders from "../helpers/Loaders";
import Platform from "../helpers/Platform";
import { s } from "../values/Strings";
import UpdateBanner from "../components/banners/UpdateBanner";
import ViewHeading from "../components/heading/ViewHeading";
import Telemetry from "../helpers/Telemetry";
import { useDispatch, useSelector } from "react-redux";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { appViewSet } from "../redux/actions/appActions";

enum ECredState {
    NotValidated = 0,
    ValidatingInProgress = 1,
    ServerUnavailable = 2,
    WrongCredentials = 3,
    OK = 4,
}

const statuses = [
    { color: undefined, text: s("credsState1") },
    { color: undefined, text: s("credsState2") },
    { color: "red", text: s("credsState3") },
    { color: "red", text: s("credsState4") },
    { color: "olive", text: s("credsState5") },
];

export function CredentialsView() {
    const [pathInvalid, setPathInvalid] = useState(false);
    const [userInvalid, setUserInvalid] = useState(false);
    const [pwdInvalid, setPwdInvalid] = useState(false);
    const [pwdNotAscii, setPwdNotAscii] = useState(false);
    const [credentialsCheckStatus, setCredentialsCheckStatus] = useState(ECredState.NotValidated);
    const [debugInputValue, setDebugInputValue] = useState("");

    const settings = useSelector(settingsSelector);

    const dispatch = useDispatch();

    useEffect(() => {
        validateTfsUser(settings.tfsUser, true);
        validateTfsPath(settings.tfsPath, true);
        validateTfsPwd(settings.tfsPwd, true);
    }, []);

    const isBackUnavailable = pathInvalid || userInvalid || pwdInvalid || credentialsCheckStatus !== ECredState.OK;

    const checkInProgress = credentialsCheckStatus === ECredState.ValidatingInProgress;

    const isCheckUnabailable = pathInvalid || userInvalid || pwdInvalid || checkInProgress || credentialsCheckStatus === ECredState.OK;

    const statusParams = statuses[credentialsCheckStatus];

    const setCredentialsStatus = (status: number) => {
        const credentialsChecked = status === ECredState.OK ? true : false;
        setCredentialsCheckStatus(status);
        dispatch(settingsUpdate({ credentialsChecked }));
    };

    const validateTfsPath = (val: string, ignoreStore?: boolean) => {
        setCredentialsStatus(ECredState.NotValidated);
        if (!ignoreStore) {
            const tfsPath = val;
            dispatch(settingsUpdate({ tfsPath }));
        }

        let invalid = false;
        if (val[val.length - 1] !== "/") invalid = true;
        if (val.indexOf("http") !== 0) invalid = true;
        if (val.indexOf("://") === -1) invalid = true;
        if (val.length < 11) invalid = true;
        setPathInvalid(invalid);
    };

    const validateTfsUser = (val: string, ignoreStore?: boolean) => {
        setCredentialsStatus(ECredState.NotValidated);
        if (!ignoreStore) {
            const tfsUser = val;
            dispatch(settingsUpdate({ tfsUser }));
        }

        let invalid = false;
        if (!val.length) invalid = true;

        if (val.indexOf("\\") < 1 || val.indexOf("\\") === val.length - 1 || val.indexOf("@") !== -1) invalid = true;

        setUserInvalid(invalid);
    };

    const validateTfsPwd = (val: string, ignoreStore?: boolean) => {
        setCredentialsStatus(ECredState.NotValidated);
        if (!ignoreStore) {
            const tfsPwd = val;
            dispatch(settingsUpdate({ tfsPwd }));
        }

        //if val has cyrillic characters show notif
        var ascii = /^[ -~]+$/;
        if (!ascii.test(val)) {
            setPwdNotAscii(true);
            setPwdInvalid(true);
        } else {
            setPwdNotAscii(false);
            setPwdInvalid(false);
        }
    };

    const onSave = () => {
        dispatch(appViewSet("settings"));
    };

    const onTest = () => {
        dispatch(appViewSet("settings"));
    };

    const onCheck = async () => {
        setCredentialsStatus(ECredState.ValidatingInProgress);

        const tfscheck = await Loaders.checkTfsPath();
        if (!tfscheck) {
            setCredentialsStatus(ECredState.ServerUnavailable);
            return;
        }

        const result = await Loaders.checkCredentials();
        if (!result) {
            setCredentialsStatus(ECredState.WrongCredentials);
        } else {
            Telemetry.accountVerificationSucceed();
            setCredentialsStatus(ECredState.OK);
            onSave();
        }
    };

    const onDebugInputChange = (e: any) => {
        if (e.target.value === "debug") dispatch(appViewSet("debug"));
        if (e.target.value === "con") Platform.current.toggleConsole();
        setDebugInputValue(e.target.value);
    };

    const debugInputRef = React.createRef();

    return (
        <div className="Page">
            <ViewHeading>
                <Button positive disabled={isBackUnavailable} onClick={onSave}>
                    {s("save")}
                </Button>
            </ViewHeading>
            <Container fluid>
                <Header as="h3" dividing>
                    {s("credsHeader")}
                </Header>
                <UpdateBanner />
                <Form loading={checkInProgress}>
                    <Form.Input
                        fluid
                        label={s("tfsPath")}
                        placeholder="http://tfs:8080/tfs/"
                        value={settings.tfsPath}
                        onChange={(e) => validateTfsPath(e.target.value)}
                        error={pathInvalid}
                    />
                    <Form.Group widths="equal">
                        <Form.Input
                            fluid
                            label={s("tfsUser")}
                            placeholder="domain\user.name"
                            value={settings.tfsUser}
                            onChange={(e) => validateTfsUser(e.target.value)}
                            error={userInvalid}
                        />
                        <Form.Input
                            fluid
                            label={s("tfsPwd")}
                            type="password"
                            value={settings.tfsPwd}
                            onChange={(e) => validateTfsPwd(e.target.value)}
                            error={pwdInvalid}
                        />
                    </Form.Group>
                    {!!pwdNotAscii && <Message color="red">{s("noAscii")}</Message>}
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
                    <Label color={statusParams.color as any}>{statusParams.text}</Label>
                </div>
                <br />
                <Button primary loading={checkInProgress} disabled={isCheckUnabailable} onClick={onCheck}>
                    {s("validate")}
                </Button>
                {/* <Button onClick={onTest}>test</Button> */}
            </Container>
            <input style={{ opacity: 0 }} ref={debugInputRef as any} type="text" value={debugInputValue} onChange={onDebugInputChange} />
        </div>
    );
}
