import { useDispatch, useSelector } from "react-redux";
import { Header, Form } from "semantic-ui-react";
import { LinksSettingsTable } from "../../../components/tables/LinksSettingsTable";
import { settingsUpdate } from "../../../redux/actions/settingsActions";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { s } from "../../../values/Strings";

export function QuickLinksSections() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

    const toggleQuickLinks = () => {
        const showQuickLinks = !settings.showQuickLinks;
        dispatch(settingsUpdate({ showQuickLinks }));
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("quickLinksSettingsHeader")}
            </Header>
            <LinksSettingsTable />
            <Form.Checkbox
                label={s("cbQuickLinksLabel")}
                checked={settings.showQuickLinks}
                onChange={toggleQuickLinks}
            />
        </>
    );
}
