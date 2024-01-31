import { useEffect, useState } from "react";
import { getAvatarContent, getEmptyAvatar } from "../modules/avatar";

export function useAvatar(avatarUrl: string) {
    const [avatar, setAvatar] = useState<string | null>(getEmptyAvatar());

    useEffect(() => {
        (async () => {
            const base64 = await getAvatarContent(avatarUrl);
            if (base64) setAvatar(base64);
        })();
    }, [avatarUrl]);

    return avatar;
}
