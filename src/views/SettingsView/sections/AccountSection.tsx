import { useDispatch, useSelector } from "react-redux";
import { Header, Button, Icon, Card, Label } from "semantic-ui-react";
import { appViewSet } from "../../../redux/actions/appActions";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { s } from "../../../values/Strings";

export function AccountSection() {
    const dispatch = useDispatch();
    const { tfsUser, tfsPath, credentialsChecked } = useSelector(settingsSelector);

    const openCreds = () => {
        dispatch(appViewSet("credentials"));
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("accountSettingsHeader")}
            </Header>
            {tfsUser && tfsPath && (
                <Card>
                    <Card.Content>
                        <Card.Header>{tfsUser}</Card.Header>
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
