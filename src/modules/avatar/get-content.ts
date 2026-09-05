import { getFromCache, putToCache } from "./cache";
import { useSettingsStore } from "../../zustand/settings";

const singletonPromises: Record<string, Promise<string | null>> = {};

export async function getAvatarContent(accountId: string, url: string): Promise<string | null> {
    if (!url) return null;

    const key = `${accountId}::${url}`;

    const cached = getFromCache(key);
    if (cached !== undefined) return cached;

    const token = useSettingsStore.getState().accounts.find((x) => x.id === accountId)?.token;

    if (!singletonPromises[key]) {
        singletonPromises[key] = loadAvatar(key, url, token || "").then((result) => {
            if (result === null) delete singletonPromises[key];
            return result;
        });
    }
    return singletonPromises[key];
}

async function loadAvatar(key: string, url: string, token: string): Promise<string | null> {
    try {
        const blob = await fetch(url, {
            headers: {
                Authorization: "Basic " + btoa(":" + token),
            },
        }).then((x) => x.blob());

        const _base64 = await blobToBase64(blob);
        const base64 = _base64 === "data:" ? null : _base64;

        putToCache(key, base64);

        return base64;
    } catch (e) {
        return null;
    }
}

function blobToBase64(blob: Blob) {
    return new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString() ?? null);
        reader.onerror = () => reject(reader.error ?? new Error("Failed to read avatar blob"));
        reader.readAsDataURL(blob);
    });
}
