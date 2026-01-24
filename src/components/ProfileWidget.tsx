import { Image, Label } from "semantic-ui-react";
import Platform from "../helpers/Platform";
import { useAvatar } from "../hooks/useAvatar";
import { HighlightenText } from "./HighlightenText";

interface IProps {
    nameFull: string;
    displayName: string;
    avatarUrl: string;
    accountId: string;
    copyName?: string;
}

export function ProfileWidget({ avatarUrl, displayName, nameFull, accountId, copyName }: IProps) {
    const avatar = useAvatar(accountId, avatarUrl);

    return (
        <span
            title={nameFull}
            onDoubleClick={() => {
                if (!copyName) return;
                Platform.current.copyString(copyName);
            }}
        >
            <Label basic image className="user-label">
                {avatar && !!displayName && <Image className="av-class" avatar spaced="right" src={avatar} />}
                <HighlightenText text={displayName} />
            </Label>
        </span>
    );
}
