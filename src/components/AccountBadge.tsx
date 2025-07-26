import { useSelector } from "react-redux";
import { Label } from "semantic-ui-react";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

export function AccountBadge(props: { accountId: string }) {
    const { accounts } = useSelector(settingsSelector);
    const badge = accounts.find((x) => x.id === props.accountId)?.badge;

    //TODO: redo badges
    switch (badge) {
        case 1:
            return (
                <Label color="yellow" size="tiny">
                    A
                </Label>
            );
        case 2:
            return (
                <Label color="yellow" size="tiny">
                    B
                </Label>
            );
        case 3:
            return (
                <Label color="yellow" size="tiny">
                    C
                </Label>
            );
        case 4:
            return (
                <Label color="yellow" size="tiny">
                    D
                </Label>
            );
        case 5:
            return (
                <Label color="yellow" size="tiny">
                    E
                </Label>
            );
    }

    return null;
}
