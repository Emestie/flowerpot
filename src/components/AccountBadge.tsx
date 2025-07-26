import { useSelector } from "react-redux";
import { Label } from "semantic-ui-react";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

export function AccountBadge(props: { accountId: string }) {
    const { accounts } = useSelector(settingsSelector);

    if (accounts.length < 2) return null;

    const account = accounts.find((x) => x.id === props.accountId);

    //TODO: redo badges
    switch (account?.badge) {
        case 1:
            return (
                <Label title={`${account.url}\n${account.displayName}`} color="green" size="tiny">
                    A
                </Label>
            );
        case 2:
            return (
                <Label title={`${account.url}\n${account.displayName}`} color="purple" size="tiny">
                    B
                </Label>
            );
        case 3:
            return (
                <Label title={`${account.url}\n${account.displayName}`} color="yellow" size="tiny">
                    C
                </Label>
            );
        case 4:
            return (
                <Label title={`${account.url}\n${account.displayName}`} color="red" size="tiny">
                    D
                </Label>
            );
        case 5:
            return (
                <Label title={`${account.url}\n${account.displayName}`} color="blue" size="tiny">
                    E
                </Label>
            );
    }

    return null;
}
