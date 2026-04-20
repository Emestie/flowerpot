import { Form, Header } from "semantic-ui-react";
import { LinksSettingsTable } from "../../../components/tables/LinksSettingsTable";
import { s } from "../../../values/Strings";
import { useSettingsStore } from "../../../zustand/settings";

export function QuickLinksSections() {
    const showQuickLinks = useSettingsStore((state) => state.showQuickLinks);

    const toggleQuickLinks = () => {
        const newValue = !showQuickLinks;
        useSettingsStore.getState().setShowQuickLinks(newValue);
    };

    return (
        <>
            <Header as="h3" dividing>
                {s("quickLinksSettingsHeader")}
            </Header>
            <Form.Checkbox
                label={s("cbQuickLinksLabel")}
                checked={showQuickLinks}
                onChange={toggleQuickLinks}
            />
            <LinksSettingsTable />
        </>
    );
}
