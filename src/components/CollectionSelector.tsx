import { useEffect, useMemo, useState } from "react";
import { Form } from "../ui/form";
import CloudAdo from "../helpers/CloudAdo";
import { AccountBadge } from "./AccountBadge";
import { useSettingsStore } from "../zustand/settings";

export function CollectionSelector(props: {
    onChange: (value: { accountId: string; collectionName: string }) => void;
    value?: { accountId: string; collectionName: string };
}) {
    const queries = useSettingsStore((state) => state.queries);
    const accounts = useSettingsStore((state) => state.accounts);

    const options = useMemo(
        () =>
            queries
                .filter(
                    (i, v, a) =>
                        a
                            .map((x) => `${x.accountId}-${x.collectionName}`)
                            .indexOf(`${i.accountId}-${i.collectionName}`) === v
                )
                .map((x, i) => ({
                    key: i,
                    text: (
                        <div className="collection-badge-row">
                            <AccountBadge accountId={x.accountId} rightGap={8} display="flex" />
                            {/*cloud collections have an empty name, the org name is displayed instead*/}
                            {CloudAdo.getCollectionDisplayName(
                                accounts.find((a) => a.id === x.accountId)?.url,
                                x.collectionName
                            )}
                        </div>
                    ),
                    value: i,
                    collectionName: x.collectionName,
                    accountId: x.accountId,
                })),
        [queries, accounts]
    );

    const [collectionIndex, setCollectionIndex] = useState(
        props.value
            ? options.findIndex(
                  (x) => x.accountId === props.value?.accountId && x.collectionName === props.value.collectionName
              )
            : 0
    );

    useEffect(() => {
        const collection = options.at(collectionIndex);

        if (collection) props.onChange({ accountId: collection.accountId, collectionName: collection.collectionName });
    }, [collectionIndex]);

    return (
        <Form.Select
            label=""
            options={options}
            value={collectionIndex}
            onChange={(e, { value }) => {
                setCollectionIndex(value as number);
            }}
        />
    );
}
