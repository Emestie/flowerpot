import acc1 from "../assets/account-badges/acc1.png";
import acc2 from "../assets/account-badges/acc2.png";
import acc3 from "../assets/account-badges/acc3.png";
import acc4 from "../assets/account-badges/acc4.png";
import acc5 from "../assets/account-badges/acc5.png";
import { Account, AccountBadge as TAccountBadge } from "../helpers/Account";
import { useSettingsStore } from "../zustand/settings";

const BADGE_IMAGES: Record<TAccountBadge, string> = {
    1: acc1,
    2: acc2,
    3: acc3,
    4: acc4,
    5: acc5,
};

const SIZE_S = 10;
const SIZE_M = 14;
const SIZE_L = 20;

export function AccountBadge(props: {
    accountId: string;
    size?: "m" | "l" | "s";
    display?: "flex" | "inline";
    rightGap?: number;
}) {
    const accounts = useSettingsStore((state) => state.accounts);

    if (accounts.length < 2) return null;

    const accountIndex = accounts.findIndex((x) => x.id === props.accountId);
    const account = accountIndex >= 0 ? accounts[accountIndex] : undefined;
    const title = `${account?.url}\n${account?.displayName}`;
    const size = props.size === "l" ? SIZE_L : props.size === "s" ? SIZE_S : SIZE_M;

    //always a valid flower, even for accounts from imported settings with a
    //missing or unexpected badge value
    const badge = Account.normalizeBadge(account?.badge, Math.max(accountIndex, 0));
    const image = <img style={{ width: size, height: size }} src={BADGE_IMAGES[badge]} title={title} />;

    return (
        <span
            style={{
                display: props.display === "flex" ? "flex" : "inline-block",
                justifyContent: "center",
                alignItems: "center",
                verticalAlign: "middle",
                marginRight: props.rightGap,
            }}
        >
            {image}
        </span>
    );
}
