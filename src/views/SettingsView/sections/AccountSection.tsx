import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Header, Icon, Label } from "semantic-ui-react";
import { appViewSet } from "../../../redux/actions/appActions";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { s } from "../../../values/Strings";
import { getConnectionData } from "/@/helpers/Connection";

export function AccountSection() {
    const dispatch = useDispatch();
    const { tfsPath, credentialsChecked } = useSelector(settingsSelector);

    const authenticatedUser = getConnectionData()?.authenticatedUser;

    const openCreds = () => {
        dispatch(appViewSet("credentials"));
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("accountSettingsHeader")}
            </Header>
            {authenticatedUser && (
                <Card>
                    <Card.Content>
                        <Card.Header>{authenticatedUser.providerDisplayName}</Card.Header>
                        <Card.Meta>{tfsPath}</Card.Meta>
                        <Card.Description>
                            <Label size="small" basic color={credentialsChecked ? "green" : "orange"}>
                                {s(credentialsChecked ? "settingsAccountChecked" : "settingsAccountNotChecked")}
                            </Label>
                        </Card.Description>
                    </Card.Content>
                </Card>
            )}
            <Button icon labelPosition="left" onClick={openCreds}>
                <Icon name="plug" />
                {s("editTfsSettingsBtn")}
            </Button>
        </>
    );
}
