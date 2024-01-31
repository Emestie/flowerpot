export function getFromCache(url: string) {
    return cache[url];
}

export function putToCache(url: string, data: string | null) {
    cache[url] = data;
}

let cache: Record<string, string | null | undefined> = {};
