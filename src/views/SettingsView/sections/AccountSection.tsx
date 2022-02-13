import { useDispatch } from "react-redux";
import { Header, Button, Icon } from "semantic-ui-react";
import { appViewSet } from "../../../redux/actions/appActions";
import { s } from "../../../values/Strings";

export function AccountSection() {
    const dispatch = useDispatch();

    const openCreds = () => {
        dispatch(appViewSet("credentials"));
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("accountSettingsHeader")}
            </Header>
            <Button icon labelPosition="left" onClick={openCreds}>
                <Icon name="plug" />
                {s("editTfsSettingsBtn")}
            </Button>
        </>
    );
}
