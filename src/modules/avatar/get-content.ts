import { getFromCache, putToCache } from "./cache";
import { store } from "/@/redux/store";

const singletonPromises: Record<string, Promise<string | null>> = {};

export async function getAvatarContent(accountId: string, url: string): Promise<string | null> {
    if (!url) return null;

    const cached = getFromCache(url);
    if (cached !== undefined) return cached;

    const token = store.getState().settings.accounts.find((x) => x.id === accountId)?.token;

    if (!singletonPromises[url]) singletonPromises[url] = loadAvatar(url, token || "");
    return singletonPromises[url];
}

async function loadAvatar(url: string, token: string): Promise<string | null> {
    try {
        //TODO: add accountId resolver here
        const blob = await fetch(url, {
            headers: {
                Authorization: "Basic " + btoa(":" + token),
            },
        }).then((x) => x.blob());

        const _base64 = await blobToBase64(blob);
        const base64 = _base64 === "data:" ? null : _base64;

        putToCache(url, base64);

        return base64;
    } catch (e) {
        return null;
    }
}

function blobToBase64(blob: Blob) {
    return new Promise<string | null>((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString() ?? null);
        reader.readAsDataURL(blob);
    });
}
