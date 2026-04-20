import { useEffect, useState } from "react";
import { Confirm, Form } from "semantic-ui-react";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { CollectionSelector } from "../CollectionSelector";
import { useDataStore } from "../../zustand/data";
import { useAppStore } from "../../zustand/app";
import { useSettingsStore } from "../../zustand/settings";

interface IProps {
    show: boolean;
}

export function OpenByIdDialog(p: IProps) {
    const setDialog = useAppStore((state) => state.setDialog);
    const openByIdLastAccountId = useSettingsStore((state) => state.openByIdLastAccountId);
    const openByIdLastCollection = useSettingsStore((state) => state.openByIdLastCollection);
    const accounts = useSettingsStore((state) => state.accounts);

    const [id, setId] = useState("");
    const [accountId, setAccountId] = useState<string | undefined>(openByIdLastAccountId);
    const [collectionName, setCollectionName] = useState<string | undefined>(openByIdLastCollection);

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
            useSettingsStore.getState().setSettings({ openByIdLastAccountId: accountId, openByIdLastCollection: collectionName });
    }, [accountId, collectionName]);

    const onConfirm = () => {
        const account = accounts.find((x) => x.id === accountId);

        if (!account || !collectionName || !id) return;

        const workItems = useDataStore.getState().workItems;
        const calculatedUrl = workItems.at(0)?.url.split("/tfs/").at(0) + "/tfs/";

        Platform.current.openUrl((calculatedUrl || account.url) + collectionName + "/_workitems/edit/" + id);

        onCancel();
    };

    const onCancel = () => {
        setDialog("openById", false);
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
