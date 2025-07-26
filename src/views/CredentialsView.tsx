import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Container, Form, Header, Label, Message } from "semantic-ui-react";
import { PageLayout } from "../components/PageLayout";
import { UpdateBanner } from "../components/banners/UpdateBanner";
import { ViewHeading } from "../components/heading/ViewHeading";
import { Account } from "../helpers/Account";
import Loaders from "../helpers/Loaders";
import Platform from "../helpers/Platform";
import { IAccount } from "../helpers/Settings";
import { Stats, UsageStat } from "../helpers/Stats";
import Telemetry from "../helpers/Telemetry";
import { appViewSet } from "../redux/actions/appActions";
import { settingsUpdate } from "../redux/actions/settingsActions";
import { appSelector } from "../redux/selectors/appSelectors";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { IStore, store } from "../redux/store";
import { s } from "../values/Strings";
import { useCredentialsModeStore } from "../zustand/credentials-mode";

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

function addAccount(account: IAccount) {
    store.dispatch(settingsUpdate({ accounts: store.getState().settings.accounts.concat(account) }));
}

function updateAccount(account: Partial<IAccount> & { id: string }) {
    const accounts = store.getState().settings.accounts;
    const index = accounts.findIndex((acc) => acc.id === account.id);

    accounts[index] = { ...accounts[index], ...account };

    store.dispatch(settingsUpdate({ accounts }));
}

export function CredentialsView() {
    const accountId = useCredentialsModeStore((s) => s.selectedAccoundId);

    const [pathInvalid, setPathInvalid] = useState(false);
    const [tokenInvalid, setTokenInvalid] = useState(false);
    const [credentialsCheckStatus, setCredentialsCheckStatus] = useState(ECredState.NotValidated);

    const settings = useSelector(settingsSelector);
    const { locale } = useSelector(appSelector);

    const _currentAccount = useSelector((state: IStore) => state.settings.accounts.find((x) => x.id === accountId));
    const [currentAccount, setCurrentAccount] = useState<IAccount>(
        _currentAccount || {
            id: Math.random().toString(),
            displayName: "",
            token: "",
            url: "",
            badge: Account.getNextAvailableBadge(),
        }
    );

    const dispatch = useDispatch();

    const isBackUnavailable = pathInvalid || tokenInvalid || credentialsCheckStatus !== ECredState.OK;

    const checkInProgress = credentialsCheckStatus === ECredState.ValidatingInProgress;

    const isCheckUnabailable =
        pathInvalid || tokenInvalid || checkInProgress || credentialsCheckStatus === ECredState.OK;

    const statusParams = statuses[credentialsCheckStatus];

    const setCredentialsStatus = useCallback(
        (status: number) => {
            const credentialsChecked = status === ECredState.OK ? true : false;
            setCredentialsCheckStatus(status);

            //TODO: get rid of global cred checked status
            if (settings.credentialsChecked !== credentialsChecked) {
                dispatch(settingsUpdate({ credentialsChecked }));
            }
        },
        [dispatch, settings.credentialsChecked]
    );

    const validateTfsPath = useCallback(
        (val: string, ignoreStore?: boolean) => {
            setCredentialsStatus(ECredState.NotValidated);
            if (!ignoreStore) {
                const tfsPath = val;
                //  if (tfsPath !== settings.tfsPath) dispatch(settingsUpdate({ tfsPath }));
                setCurrentAccount((ca) => ({ ...ca, url: tfsPath }));
            }

            let invalid = false;
            if (val[val.length - 1] !== "/") invalid = true;
            if (val.indexOf("http") !== 0) invalid = true;
            if (val.indexOf("://") === -1) invalid = true;
            if (val.length < 11) invalid = true;
            setPathInvalid(invalid);
        },
        [dispatch, setCredentialsStatus, currentAccount.url]
    );

    const validateTfsToken = useCallback(
        (token: string, ignoreStore?: boolean) => {
            setCredentialsStatus(ECredState.NotValidated);

            if (!ignoreStore) {
                if (token !== settings.tfsToken) dispatch(settingsUpdate({ tfsToken: token }));
                // if (token !== currentAccount?.token) updateAccount({ token, id: currentAccount?.id });
                setCurrentAccount((ca) => ({ ...ca, token }));
            }

            const invalid = token.length < 45;

            setTokenInvalid(invalid);
        },
        [dispatch, setCredentialsStatus, currentAccount.token]
    );

    useEffect(() => {
        validateTfsPath(currentAccount.url, true);
        validateTfsToken(currentAccount.token, true);
        //eslint-disable-next-line
    }, [currentAccount]);

    const onOk = () => {
        dispatch(appViewSet("settings"));
    };

    const onCheck = async () => {
        setCredentialsStatus(ECredState.ValidatingInProgress);

        const tfscheck = await Loaders.checkTfsPath(currentAccount.url);
        if (!tfscheck) {
            setCredentialsStatus(ECredState.ServerUnavailable);
            return;
        }

        const result = await Loaders.checkCredentials(currentAccount.url, currentAccount.token);
        if (!result) {
            setCredentialsStatus(ECredState.WrongCredentials);
        } else {
            const displayName =
                (await Loaders.getUserDisplayName(currentAccount.url, currentAccount.token)) ??
                Account.generateDisplayNameByToken(currentAccount.token);

            Stats.increment(UsageStat.AccountVerifications);
            setCredentialsStatus(ECredState.OK);

            if (accountId) {
                updateAccount({ ...currentAccount, displayName });
            } else {
                addAccount({ ...currentAccount, displayName });
            }

            Telemetry.accountVerificationSucceed(currentAccount.id);

            onOk();
        }
    };

    const debugInputRef = React.createRef();

    return (
        <PageLayout
            heading={
                <ViewHeading>
                    <Button positive disabled={isBackUnavailable} onClick={onOk}>
                        {s("save")}
                    </Button>
                </ViewHeading>
            }
        >
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
                        value={currentAccount?.url ?? ""}
                        onChange={(e) => validateTfsPath(e.target.value)}
                        error={pathInvalid}
                    />
                    <Message info>
                        {s("credsTokenInfo1")}{" "}
                        <b>
                            <i>{s("credsTokenInfo2")}</i>
                        </b>{" "}
                        {s("credsTokenInfo3")}
                        <br />
                        <div style={{ marginTop: 10, marginBottom: -10 }}>
                            <Button
                                primary
                                size="small"
                                style={{ marginRight: 10 }}
                                onClick={() => {
                                    Platform.current.openUrl(
                                        "https://learn.microsoft.com/" +
                                            (locale === "ru" ? "ru-ru" : "en-us") +
                                            "/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#create-a-pat"
                                    );
                                }}
                            >
                                {s("credsTokenOpenDocs")}
                            </Button>
                            <Button
                                primary
                                size="small"
                                disabled={pathInvalid}
                                onClick={() => {
                                    Platform.current.openUrl(currentAccount?.url + "_usersSettings/tokens");
                                }}
                            >
                                {s("credsTokenOpenCreatePage")}
                            </Button>
                        </div>
                        <br />
                        {s("credsTokenInfo4")}
                    </Message>
                    <Form.Input
                        fluid
                        label={s("tfsToken")}
                        value={currentAccount?.token ?? ""}
                        onChange={(e) => validateTfsToken(e.target.value)}
                        error={tokenInvalid}
                    />
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
                <Button positive loading={checkInProgress} disabled={isCheckUnabailable} onClick={onCheck}>
                    {s("validate")}
                </Button>
            </Container>
        </PageLayout>
    );
}
