import { Icon, Image, Label } from "semantic-ui-react";
import { PullRequestReviewer } from "../../models/pull-request-reviewer";
import { useAvatar } from "/@/hooks/useAvatar";
import { s } from "/@/values/Strings";

interface P {
    accountId: string;
    reviewer: PullRequestReviewer;
}

export function PRReviewer({ reviewer, accountId }: P) {
    const getStatusIcon = (vote: number) => {
        if (vote === 0) return null;

        const color = vote > 0 ? "green" : vote < -5 ? "red" : "orange";
        const iconName = vote > 0 ? "check circle" : vote < -5 ? "times circle" : "clock";

        return <Icon className="pr-reviewer-status" name={iconName} color={color} />;
    };

    const avatar = useAvatar(accountId, reviewer.imageUrl);

    return (
        <span
            title={reviewer.name + (reviewer.isRequired ? ` (${s("requiredReviewer")})` : "")}
            className="pr-reviewer-overlap"
        >
            <Label basic image className="user-label">
                <Image
                    className={`av-class${reviewer.isRequired ? " pr-reviewer-required" : ""}`}
                    avatar
                    src={avatar}
                />
                {getStatusIcon(reviewer.vote)}
            </Label>
        </span>
    );
}
