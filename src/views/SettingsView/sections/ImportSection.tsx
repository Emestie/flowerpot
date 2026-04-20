import { Button, Header } from "semantic-ui-react";
import { useAppStore } from "../../../zustand/app";
import { useSettingsStore } from "../../../zustand/settings";
import { s } from "../../../values/Strings";

export function ImportSection() {
    const setDialog = useAppStore((s) => s.setDialog);
    const accounts = useSettingsStore((state) => state.accounts);

    return (
        <>
            <Header as="h3" dividing>
                {s("sectionImport")}
            </Header>
            {s("importSettingsDesc")}
            <br />
            <br />
            {accounts.length > 0 && (
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
