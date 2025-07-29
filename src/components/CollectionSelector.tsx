import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Form } from "semantic-ui-react";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { AccountBadge } from "./AccountBadge";

export function CollectionSelector(props: {
    onChange: (value: { accountId: string; collectionName: string }) => void;
    value?: { accountId: string; collectionName: string };
}) {
    const settings = useSelector(settingsSelector);

    const options = useMemo(
        () =>
            settings.queries
                .filter(
                    (i, v, a) =>
                        a
                            .map((x) => `${x.accountId}-${x.collectionName}`)
                            .indexOf(`${i.accountId}-${i.collectionName}`) === v
                )
                .map((x, i) => ({
                    key: i,
                    text: (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <AccountBadge accountId={x.accountId} rightGap={8} display="flex" />
                            {x.collectionName}
                        </div>
                    ),
                    value: i,
                    collectionName: x.collectionName,
                    accountId: x.accountId,
                })),
        [settings]
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
