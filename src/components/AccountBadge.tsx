import { useSelector } from "react-redux";
import acc1 from "../assets/account-badges/acc1.png";
import acc2 from "../assets/account-badges/acc2.png";
import acc3 from "../assets/account-badges/acc3.png";
import acc4 from "../assets/account-badges/acc4.png";
import acc5 from "../assets/account-badges/acc5.png";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

const SIZE_M = 14;
const SIZE_L = 20;

export function AccountBadge(props: {
    accountId: string;
    size?: "m" | "l";
    display?: "flex" | "inline";
    rightGap?: number;
}) {
    const { accounts } = useSelector(settingsSelector);

    if (accounts.length < 2) return null;

    const account = accounts.find((x) => x.id === props.accountId);
    const title = `${account?.url}\n${account?.displayName}`;
    const size = props.size === "l" ? SIZE_L : SIZE_M;

    let image = null;

    switch (account?.badge || 5) {
        case 1:
            image = <img style={{ width: size, height: size }} src={acc1} title={title} />;
            break;
        case 2:
            image = <img style={{ width: size, height: size }} src={acc2} title={title} />;
            break;
        case 3:
            image = <img style={{ width: size, height: size }} src={acc3} title={title} />;
            break;
        case 4:
            image = <img style={{ width: size, height: size }} src={acc4} title={title} />;
            break;
        case 5:
            image = <img style={{ width: size, height: size }} src={acc5} title={title} />;
            break;
    }

    return (
        <span
            style={{
                width: size,
                height: props.display === "flex" ? undefined : size,
                display: props.display === "flex" ? "flex" : "inline-block",
                justifyContent: "center",
                alignItems: "center",
                marginRight: props.rightGap,
            }}
        >
            {image}
        </span>
    );
}
