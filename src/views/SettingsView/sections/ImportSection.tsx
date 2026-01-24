import { useDispatch, useSelector } from "react-redux";
import { Button, Header } from "semantic-ui-react";
import { appDialogSet } from "../../../redux/actions/appActions";
import { settingsSelector } from "../../../redux/selectors/settingsSelectors";
import { s } from "../../../values/Strings";

export function ImportSection() {
    const dispatch = useDispatch();
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
                        dispatch(appDialogSet("exportSettings", true));
                    }}
                >
                    {s("doExportSettings")}
                </Button>
            )}
            <br />
            <br />
            <Button
                onClick={() => {
                    dispatch(appDialogSet("importSettings", true));
                }}
            >
                {s("doImportSettings")}
            </Button>
        </>
    );
}
