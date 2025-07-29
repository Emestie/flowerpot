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
                                    store.dispatch(
                                        settingsUpdate({
                                            accounts: store
                                                .getState()
                                                .settings.accounts.filter((x) => x.id !== props.account.id),
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
