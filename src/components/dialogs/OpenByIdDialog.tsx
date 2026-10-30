import { useEffect, useState } from "react";
import { Form } from "../../ui/form";
import { Confirm } from "../../ui/confirm";
import CloudAdo from "../../helpers/CloudAdo";
import Platform from "../../helpers/Platform";
import { s } from "../../values/Strings";
import { useAppStore } from "../../zustand/app";
import { useDataStore } from "../../zustand/data";
import { useSettingsStore } from "../../zustand/settings";
import { CollectionSelector } from "../CollectionSelector";

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
            useSettingsStore
                .getState()
                .setSettings({ openByIdLastAccountId: accountId, openByIdLastCollection: collectionName });
    }, [accountId, collectionName]);

    const onConfirm = () => {
        const account = accounts.find((x) => x.id === accountId);

        //cloud collections have an empty name, so the check must distinguish
        //the undefined selector state from a selected empty-named collection
        if (!account || collectionName === undefined || !id) return;

        const workItems = useDataStore.getState().workItems;
        //on ADO Services the account URL is already the deep link base (the
        ///_workitems/edit/{id} route redirects to the project), on-premises the
        //base is derived from the work item API URL or falls back to the account
        //the trailing slash is stripped: cloud collections are empty-named and
        //the route below adds its own leading slash
        const firstWorkItemUrl = workItems.at(0)?.url;
        const calculatedUrl = CloudAdo.isCloudUrl(account.url)
            ? CloudAdo.canonicalizeUrl(account.url).replace(/\/+$/, "")
            : firstWorkItemUrl?.includes("/tfs/")
              ? firstWorkItemUrl.split("/tfs/").at(0) + "/tfs/"
              : undefined;

        Platform.current.openUrl((calculatedUrl || account.url) + collectionName + "/_workitems/edit/" + id);

        onCancel();
    };

    const onCancel = () => {
        setDialog("openById", false);
        setId("");
    };

    const content = (
        <div
            className="dialog-content"
            onKeyPress={(e) => {
                if (e.charCode === 13) onConfirm();
            }}
        >
            <div className="dialog-caption">{s("openByIdText")}</div>
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
                            className="af-input"
                            value={id}
                            onChange={(e) => {
                                setId(e.target.value);
                            }}
                            maxLength="50"
                        />
                    </Form.Group>
                </Form>
            </div>
        </div>
    );

    return <Confirm open={p.show} content={content} onCancel={onCancel} onConfirm={onConfirm} />;
}
