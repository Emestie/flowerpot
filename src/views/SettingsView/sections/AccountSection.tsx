import { Button, ButtonGroup, Card, CardGroup, Header, Icon } from "semantic-ui-react";
import { AccountBadge } from "../../../components/AccountBadge";
import { IAccount } from "../../../helpers/Settings";
import { s } from "../../../values/Strings";
import { useAppStore } from "../../../zustand/app";
import { useCredentialsModeStore } from "../../../zustand/credentials-mode";
import { useSettingsStore } from "../../../zustand/settings";

export function AccountSection() {
    const accounts = useSettingsStore((state) => state.accounts);

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
                        useAppStore.getState().setView("credentials");
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
    const settings = useSettingsStore.getState();

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
                                useAppStore.getState().setView("credentials");
                            }}
                        >
                            <Icon name="edit" />
                        </Button>
                        {props.deleteable && (
                            <Button
                                negative
                                onClick={() => {
                                    settings.setSettings({
                                        accounts: settings.accounts.filter((x) => x.id !== props.account.id),
                                        projects: settings.projects.filter(
                                            (x) => x.accountId !== props.account.id
                                        ),
                                        queries: settings.queries.filter(
                                            (x) => x.accountId !== props.account.id
                                        ),
                                        lists: {
                                            deferred:
                                                settings.lists?.deferred.filter(
                                                    (x) => x.accountId !== props.account.id
                                                ) || [],
                                            favorites:
                                                settings.lists?.favorites.filter(
                                                    (x) => x.accountId !== props.account.id
                                                ) || [],
                                            forwarded:
                                                settings.lists?.forwarded.filter(
                                                    (x) => x.accountId !== props.account.id
                                                ) || [],
                                            hidden:
                                                settings.lists?.hidden.filter(
                                                    (x) => x.accountId !== props.account.id
                                                ) || [],
                                            keywords: settings.lists?.keywords || [],
                                            permawatch:
                                                settings.lists?.permawatch.filter(
                                                    (x) => x.accountId !== props.account.id
                                                ) || [],
                                            pinned:
                                                settings.lists?.pinned.filter(
                                                    (x) => x.accountId !== props.account.id
                                                ) || [],
                                        },
                                        notes: settings.notes.filter((x) => x.accountId !== props.account.id),
                                    });
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
