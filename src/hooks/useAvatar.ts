import { useEffect, useState } from "react";
import { getAvatarContent, getEmptyAvatar } from "../modules/avatar";

export function useAvatar(accountId: string, avatarUrl: string) {
    const [avatar, setAvatar] = useState<string | null>(getEmptyAvatar());

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const base64 = await getAvatarContent(accountId, avatarUrl);
            if (!cancelled && base64) setAvatar(base64);
        })();
        return () => {
            cancelled = true;
        };
    }, [accountId, avatarUrl]);

    return avatar;
}
