import { useSelector } from "react-redux";
import { Image, Label } from "semantic-ui-react";
import { useAvatar } from "../hooks/useAvatar";
import { IStore } from "../redux/store";

interface IProps {
    nameFull: string;
    displayName: string;
    avatarUrl: string;
}

export function ProfileWidget({ avatarUrl, displayName, nameFull }: IProps) {
    const { showAvatars } = useSelector((state: IStore) => state.settings);

    const avatar = useAvatar(avatarUrl);

    return (
        <span title={nameFull}>
            <Label basic image className="user-label">
                {showAvatars && avatar && <Image className="av-class" avatar spaced="right" src={avatar} />}
                {displayName}
            </Label>
        </span>
    );
}
