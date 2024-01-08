import { putToCache } from "./cache";
import { store } from "/@/redux/store";

export async function getAvatarContent(url: string): Promise<string | null> {
    if (!url) return null;

    const blob = await fetch(url, {
        headers: {
            Authorization: "Basic " + btoa(":" + store.getState().settings.tfsToken),
        },
    }).then((x) => x.blob());

    const base64 = await blobToBase64(blob);

    putToCache(url, base64);

    return base64;
}

function blobToBase64(blob: Blob) {
    return new Promise<string | null>((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString() || null);
        reader.readAsDataURL(blob);
    });
}
