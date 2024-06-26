import { Image, Label } from "semantic-ui-react";
import { useAvatar } from "../hooks/useAvatar";
import { HighlightenText } from "./HighlightenText";

interface IProps {
    nameFull: string;
    displayName: string;
    avatarUrl: string;
}

export function ProfileWidget({ avatarUrl, displayName, nameFull }: IProps) {
    const avatar = useAvatar(avatarUrl);

    return (
        <span title={nameFull}>
            <Label basic image className="user-label">
                {avatar && !!displayName && <Image className="av-class" avatar spaced="right" src={avatar} />}
                <HighlightenText text={displayName} />
            </Label>
        </span>
    );
}
