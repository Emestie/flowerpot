import { useDispatch } from "react-redux";
import { Header, Button, Icon } from "semantic-ui-react";
import { QueriesSettingsTable } from "../../../components/tables/QueriesSettingsTable";
import { appViewSet } from "../../../redux/actions/appActions";
import { s } from "../../../values/Strings";

export function QueriesSection() {
    const dispatch = useDispatch();

    const openListsView = () => {
        dispatch(appViewSet("lists"));
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("settingsQueriesHeader")}
            </Header>
            <QueriesSettingsTable />
            <Header as="h3" dividing>
                {s("customListsSettingsHeader")}
            </Header>
            <Button icon labelPosition="left" onClick={openListsView}>
                <Icon name="tasks" /> {s("manageLists")}
            </Button>
        </>
    );
}
