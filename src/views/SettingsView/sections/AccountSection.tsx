import { useSelector } from "react-redux";
import { Button, ButtonGroup, Card, CardGroup, Header, Icon } from "semantic-ui-react";
import { AccountBadge } from "../../../components/AccountBadge";
import { IAccount } from "../../../helpers/Settings";
import { appViewSet } from "../../../redux/actions/appActions";
import { settingsUpdate } from "../../../redux/actions/settingsActions";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { store } from "../../../redux/store";
import { s } from "../../../values/Strings";
import { useCredentialsModeStore } from "../../../zustand/credentials-mode";

export function AccountSection() {
    const { accounts } = useSelector(settingsSelector);

    return (
        <>
            <Header as="h3" dividing>
                {s("accountSettingsHeader")}
            </Header>
            <CardGroup>
                {accounts.map((account) => (
                    <AccountCard key={account.id} account={account} deleteable={accounts.length > 1} />
                ))}
            </CardGroup>
            <div style={{ marginTop: 16 }}></div>
            {accounts.length < 3 && (
                <Button
                    icon
                    labelPosition="left"
                    primary
                    onClick={() => {
                        useCredentialsModeStore.getState().setSelectedAccountId(null);
                        store.dispatch(appViewSet("credentials"));
                    }}
                >
                    <Icon name="plus" />
                    {s("addAccount")}
                </Button>
            )}
        </>
    );
}

function AccountCard(props: { account: IAccount; deleteable: boolean }) {
    return (
        <Card>
            <Card.Content>
                <Card.Header>
                    <AccountBadge accountId={props.account.id} size="l" /> {props.account.displayName}
                </Card.Header>
                <Card.Meta>{props.account.url}</Card.Meta>
                <div style={{ marginTop: 8 }}>
                    <ButtonGroup size="tiny" compact icon>
                        <Button
                            onClick={() => {
                                useCredentialsModeStore.getState().setSelectedAccountId(props.account.id);
                                store.dispatch(appViewSet("credentials"));
                            }}
                        >
                            <Icon name="edit" />
                        </Button>
                        {props.deleteable && (
                            <Button
                                negative
                                onClick={() => {
                                    const state = store.getState();

                                    store.dispatch(
                                        settingsUpdate({
                                            accounts: state.settings.accounts.filter((x) => x.id !== props.account.id),
                                            projects: state.settings.projects.filter(
                                                (x) => x.accountId !== props.account.id
                                            ),
                                            queries: state.settings.queries.filter(
                                                (x) => x.accountId !== props.account.id
                                            ),
                                            lists: {
                                                deferred:
                                                    state.settings.lists?.deferred.filter(
                                                        (x) => x.accountId !== props.account.id
                                                    ) || [],
                                                favorites:
                                                    state.settings.lists?.favorites.filter(
                                                        (x) => x.accountId !== props.account.id
                                                    ) || [],
                                                forwarded:
                                                    state.settings.lists?.forwarded.filter(
                                                        (x) => x.accountId !== props.account.id
                                                    ) || [],
                                                hidden:
                                                    state.settings.lists?.hidden.filter(
                                                        (x) => x.accountId !== props.account.id
                                                    ) || [],
                                                keywords: state.settings.lists?.keywords || [],
                                                permawatch:
                                                    state.settings.lists?.permawatch.filter(
                                                        (x) => x.accountId !== props.account.id
                                                    ) || [],
                                                pinned:
                                                    state.settings.lists?.pinned.filter(
                                                        (x) => x.accountId !== props.account.id
                                                    ) || [],
                                            },
                                            notes: state.settings.notes.filter((x) => x.accountId !== props.account.id),
                                        })
                                    );
                                }}
                            >
                                <Icon name="delete" />
                            </Button>
                        )}
                    </ButtonGroup>
                </div>
            </Card.Content>
        </Card>
    );
}
