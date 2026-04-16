import { useSelector } from "react-redux";
import { Button, Header } from "semantic-ui-react";
import { useAppStore } from "../../../zustand/app";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { s } from "../../../values/Strings";

export function ImportSection() {
    const setDialog = useAppStore((s) => s.setDialog);
    const settings = useSelector(settingsSelector);

    return (
        <>
            <Header as="h3" dividing>
                {s("sectionImport")}
            </Header>
            {s("importSettingsDesc")}
            <br />
            <br />
            {settings.accounts.length > 0 && (
                <Button
                    onClick={() => {
                        setDialog("exportSettings", true);
                    }}
                >
                    {s("doExportSettings")}
                </Button>
            )}
            <br />
            <br />
            <Button
                onClick={() => {
                    setDialog("importSettings", true);
                }}
            >
                {s("doImportSettings")}
            </Button>
        </>
    );
}
