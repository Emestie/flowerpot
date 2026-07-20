import { Header } from "../../../ui/header";
import { QueriesSettingsTable } from "../../../components/tables/QueriesSettingsTable";
import { s } from "../../../values/Strings";

export function QueriesSection() {
    return (
        <>
            <Header as="h3" dividing>
                {s("settingsQueriesHeader")}
            </Header>
            <QueriesSettingsTable />
        </>
    );
}
