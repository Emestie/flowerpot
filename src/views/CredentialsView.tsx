import { createRef, useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label, type TColor } from "../ui/label";
import { Container } from "../ui/container";
import { Form } from "../ui/form";
import { Header } from "../ui/header";
import { Message } from "../ui/message";
import { PageLayout } from "../components/PageLayout";
import { UpdateBanner } from "../components/banners/UpdateBanner";
import { ViewHeading } from "../components/heading/ViewHeading";
import { Account } from "../helpers/Account";
import Loaders from "../helpers/Loaders";
import Platform from "../helpers/Platform";
import { IAccount } from "../helpers/Settings";
import Telemetry from "../helpers/Telemetry";
import { s } from "../values/Strings";
import { useAppStore } from "../zustand/app";
import { useCredentialsModeStore } from "../zustand/credentials-mode";
import { useSettingsStore } from "../zustand/settings";

enum ECredState {
    NotValidated = 0,
    ValidatingInProgress = 1,
    WrongCredentials = 2,
    OK = 3,
    Duplication = 4,
    InsufficientPermissions = 5,
}

const statuses: { color?: TColor; text: string }[] = [
    { color: undefined, text: s("credsState1") },
    { color: undefined, text: s("credsState2") },
    { color: "red", text: s("credsState4") },
    { color: "olive", text: s("credsState5") },
    { color: "orange", text: s("credsState6") },
    { color: "red", text: s("credsStateInsufficientPermissions") },
];

function addAccount(account: IAccount) {
    useSettingsStore.getState().setAccounts(useSettingsStore.getState().accounts.concat(account));
}

function updateAccount(account: Partial<IAccount> & { id: string }) {
    const accounts = [...useSettingsStore.getState().accounts];
    const index = accounts.findIndex((acc) => acc.id === account.id);

    accounts[index] = { ...accounts[index], ...account };

    useSettingsStore.getState().setAccounts(accounts);
}

export function CredentialsView() {
    const accountId = useCredentialsModeStore((s) => s.selectedAccoundId);
    const locale = useAppStore((state) => state.locale);
    const setView = useAppStore((state) => state.setView);

    const [pathInvalid, setPathInvalid] = useState(false);
    const [tokenInvalid, setTokenInvalid] = useState(false);
    const [credentialsCheckStatus, setCredentialsCheckStatus] = useState(ECredState.NotValidated);

    const accounts = useSettingsStore((state) => state.accounts);

    const _currentAccount = accounts.find((x) => x.id === accountId);
    const [currentAccount, setCurrentAccount] = useState<IAccount>(
        _currentAccount || {
            id: Math.random().toString(),
            displayName: "",
            token: "",
            url: "",
            descriptor: undefined,
            badge: Account.getNextAvailableBadge(),
        }
    );

    const checkInProgress = credentialsCheckStatus === ECredState.ValidatingInProgress;

    const isCheckUnabailable =
        pathInvalid || tokenInvalid || checkInProgress || credentialsCheckStatus === ECredState.OK;

    const statusParams = statuses[credentialsCheckStatus];

    const validateTfsPath = useCallback(
        (val: string, ignoreStore?: boolean) => {
            setCredentialsCheckStatus(ECredState.NotValidated);
            if (!ignoreStore) {
                const tfsPath = val;
                setCurrentAccount((ca) => ({ ...ca, url: tfsPath }));
            }

            let invalid = false;
            if (val[val.length - 1] !== "/") invalid = true;
            if (val.indexOf("http") !== 0) invalid = true;
            if (val.indexOf("://") === -1) invalid = true;
            if (val.length < 11) invalid = true;
            setPathInvalid(invalid);
        },
        [currentAccount.url]
    );

    const validateTfsToken = useCallback(
        (token: string, ignoreStore?: boolean) => {
            setCredentialsCheckStatus(ECredState.NotValidated);

            if (!ignoreStore) {
                setCurrentAccount((ca) => ({ ...ca, token }));
            }

            const invalid = token.length < 45;

            setTokenInvalid(invalid);
        },
        [currentAccount.token]
    );

    useEffect(() => {
        validateTfsPath(currentAccount.url, true);
        validateTfsToken(currentAccount.token, true);
        //eslint-disable-next-line
    }, [currentAccount]);

    const goToSettings = () => {
        setView("settings");
    };

    const onCheck = async () => {
        setCredentialsCheckStatus(ECredState.ValidatingInProgress);

        const result = await Loaders.checkCredentials(currentAccount.url, currentAccount.token);
        if (!result) {
            setCredentialsCheckStatus(ECredState.WrongCredentials);
            return;
        }

        const permResult = await Loaders.checkPermissions(currentAccount.url, currentAccount.token);
        if (!permResult.ok) {
            setCredentialsCheckStatus(ECredState.InsufficientPermissions);
            return;
        }

        if (
            accounts.some(
                (acc) => acc.id !== accountId && acc.url === currentAccount.url && acc.token === currentAccount.token
            )
        ) {
            setCredentialsCheckStatus(ECredState.Duplication);
            return;
        }

        const userData =
            (await Loaders.getUserData(currentAccount.url, currentAccount.token)) ??
            Account.generateDisplayNameByToken(currentAccount.token);

        const displayName = userData.displayName ?? Account.generateDisplayNameByToken(currentAccount.token);
        const descriptor = userData.descriptor;

        setCredentialsCheckStatus(ECredState.OK);

        if (accountId) {
            updateAccount({ ...currentAccount, displayName, descriptor });
        } else {
            addAccount({ ...currentAccount, displayName, descriptor });
        }

        Telemetry.accountVerificationSucceed(currentAccount.id);

        goToSettings();
    };

    const debugInputRef = createRef();

    return (
        <PageLayout heading={<ViewHeading />}>
            <Container fluid>
                <Header as="h3" dividing>
                    {s(accountId ? "credsHeaderEdit" : "credsHeaderAdd")}
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
                        <div className="btn-group-wrap">
                            <Button
                                primary
                                size="small"
                                className="mr-10"
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
                    <Label color={statusParams.color}>{statusParams.text}</Label>
                </div>
                <br />
                <Button primary loading={checkInProgress} disabled={isCheckUnabailable} onClick={onCheck}>
                    {s("validate")}
                </Button>
                <Button loading={checkInProgress} onClick={goToSettings}>
                    {s("cancel")}
                </Button>
            </Container>
        </PageLayout>
    );
}
