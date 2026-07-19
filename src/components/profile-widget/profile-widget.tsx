import Platform from "../../helpers/Platform";
import { useAvatar } from "../../hooks/useAvatar";
import { HighlightenText } from "../HighlightenText";
import styles from "./profile-widget.module.css";

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
            <span className={styles.label}>
                {avatar && !!displayName && <img className={styles.avatar} src={avatar} alt="" />}
                <HighlightenText text={displayName} />
            </span>
        </span>
    );
}
