import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Confirm, Form } from "semantic-ui-react";
import Platform from "../../helpers/Platform";
import { appDialogSet } from "../../redux/actions/appActions";
import { settingsUpdate } from "../../redux/actions/settingsActions";
import { settingsSelector } from "../../redux/selectors/settingsSelectors";
import { s } from "../../values/Strings";
import { CollectionSelector } from "../CollectionSelector";

interface IProps {
    show: boolean;
}

export function OpenByIdDialog(p: IProps) {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

    const [id, setId] = useState("");
    const [accountId, setAccountId] = useState<string | undefined>(settings.openByIdLastAccountId);
    const [collectionName, setCollectionName] = useState<string | undefined>(settings.openByIdLastCollection);

    useEffect(() => {
        if (p.show) {
            const inp1 = document.querySelector(".af-input input");
            const inp2 = document.querySelector("textarea.af-input");
            if (inp1) (inp1 as any).focus();
            if (inp2) (inp2 as any).focus();
        }
    }, [p.show]);

    useEffect(() => {
        if (accountId && collectionName)
            dispatch(settingsUpdate({ openByIdLastAccountId: accountId, openByIdLastCollection: collectionName }));
    }, [accountId, collectionName]);

    const onConfirm = () => {
        const account = settings.accounts.find((x) => x.id === accountId);

        if (!account || !collectionName || !id) return;

        Platform.current.openUrl(account.url + collectionName + "/_workitems/edit/" + id);

        onCancel();
    };

    const onCancel = () => {
        dispatch(appDialogSet("openById", false));
        setId("");
    };

    const content = (
        <div
            style={{ padding: 20 }}
            onKeyPress={(e) => {
                if (e.charCode === 13) onConfirm();
            }}
        >
            <div style={{ marginBottom: 20 }}>{s("openByIdText")}</div>
            <div>
                <Form>
                    <Form.Group inline>
                        <CollectionSelector
                            onChange={({ accountId, collectionName }) => {
                                setAccountId(accountId);
                                setCollectionName(collectionName);
                            }}
                            value={accountId && collectionName ? { accountId, collectionName } : undefined}
                        />
                        <Form.Input
                            style={{ width: "100%" }}
                            value={id}
                            onChange={(e) => {
                                setId(e.target.value);
                            }}
                            maxLength="50"
                            className="af-input"
                        />
                    </Form.Group>
                </Form>
            </div>
        </div>
    );

    return <Confirm open={p.show} content={content} onCancel={onCancel} onConfirm={onConfirm} />;
}
