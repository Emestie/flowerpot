import { Icon } from "/@/ui/icon";
import { PullRequestReviewer } from "../../../models/pull-request-reviewer";
import { useAvatar } from "/@/hooks/useAvatar";
import { s } from "/@/values/Strings";
import styles from "./pr-reviewer.module.css";

interface P {
    accountId: string;
    reviewer: PullRequestReviewer;
}

export function PRReviewer({ reviewer, accountId }: P) {
    const getStatusIcon = (vote: number) => {
        if (vote === 0) return null;

        const color = vote > 0 ? "green" : vote < -5 ? "red" : "orange";
        const iconName = vote > 0 ? "check circle" : vote < -5 ? "times circle" : "clock";

        return <Icon className={styles.statusIcon} name={iconName} color={color} />;
    };

    const avatar = useAvatar(accountId, reviewer.imageUrl);

    return (
        <span title={reviewer.name + (reviewer.isRequired ? ` (${s("requiredReviewer")})` : "")}>
            <span className={styles.label}>
                <span className={`${styles.avatarWrap}${reviewer.isRequired ? ` ${styles.requiredBorder}` : ""}`}>
                    <img className={styles.avatar} src={avatar ?? undefined} alt="" />
                </span>
                {getStatusIcon(reviewer.vote)}
            </span>
        </span>
    );
}
