/* Flowerpot service worker: offline support for the PWA/web build.
 *
 * Strategy:
 * - Navigations: network-first, falling back to the cached app shell.
 * - Same-origin static assets: cache-first, refreshing the cache in background.
 * - Cross-origin GET (fonts, dynamic-content CDN): cache-first so the
 *   second visit works offline.
 * Non-GET requests (Azure DevOps API calls) always go to the network.
 */

const CACHE = "flowerpot-v1";
const APP_SHELL = "./index.html";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE)
            .then((cache) => cache.add(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

function cacheInBackground(request, response) {
    if (!response || !response.ok) return response;
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
    return response;
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // Cross-origin content (Google Fonts, raw.githubusercontent dynamic-content):
    // cache-first, populate cache on miss.
    if (url.origin !== self.location.origin) {
        event.respondWith(
            caches
                .match(request)
                .then((hit) => hit || fetch(request).then((response) => cacheInBackground(request, response)))
        );
        return;
    }

    // App navigation: network-first, fall back to the cached shell offline.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => cacheInBackground(APP_SHELL, response))
                .catch(() => caches.match(APP_SHELL))
        );
        return;
    }

    // Same-origin static assets: cache-first, refresh in background.
    event.respondWith(
        caches.match(request).then(
            (hit) =>
                hit ||
                fetch(request)
                    .then((response) => cacheInBackground(request, response))
                    .catch(() => hit)
        )
    );
});
