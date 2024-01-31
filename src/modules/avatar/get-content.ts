import { getFromCache, putToCache } from "./cache";
import { store } from "/@/redux/store";

const singletonPromises: Record<string, Promise<string | null>> = {};

export async function getAvatarContent(url: string): Promise<string | null> {
    if (!url) return null;

    const cached = getFromCache(url);
    if (cached !== undefined) return cached;

    if (!singletonPromises[url]) singletonPromises[url] = loadAvatar(url);
    return singletonPromises[url];
}

async function loadAvatar(url: string): Promise<string | null> {
    try {
        const blob = await fetch(url, {
            headers: {
                Authorization: "Basic " + btoa(":" + store.getState().settings.tfsToken),
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
