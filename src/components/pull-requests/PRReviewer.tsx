import { Icon, Image, Label } from "semantic-ui-react";
import { useAvatar } from "/@/hooks/useAvatar";
import { IPullRequestReviewer } from "/@/modules/api-client";
import { s } from "/@/values/Strings";

interface P {
    reviewer: IPullRequestReviewer;
}

const statusIconStyle = {
    position: "absolute",
    right: 5,
    bottom: 0,
    backgroundColor: "white",
    borderRadius: "50%",
};

export function PRReviewer({ reviewer }: P) {
    const getStatusIcon = (vote: number) => {
        if (vote === 0) return null;

        const color = vote > 0 ? "green" : vote < -5 ? "red" : "orange";
        const iconName = vote > 0 ? "check circle" : vote < -5 ? "times circle" : "clock";

        return <Icon style={statusIconStyle} name={iconName} color={color} />;
    };

    const avatar = useAvatar(reviewer.imageUrl);

    return (
        <span
            title={reviewer.name + (reviewer.isRequired ? ` (${s("requiredReviewer")})` : "")}
            style={{ marginRight: "-12px" }}
        >
            <Label basic image className="user-label">
                <Image
                    className="av-class"
                    avatar
                    src={avatar}
                    style={reviewer.isRequired ? { border: "2px solid #21cfff" } : {}}
                />
                {getStatusIcon(reviewer.vote)}
            </Label>
        </span>
    );
}
