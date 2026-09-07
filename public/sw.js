/* Flowerpot service worker: offline support for the PWA/web build.
 *
 * Strategy:
 * - Navigations: network-first, falling back to the cached app shell.
 * - Same-origin static assets: cache-first, refreshing the cache in background.
 * - Known cross-origin static CDNs (fonts, dynamic-content): cache-first so
 *   the second visit works offline.
 * - Everything else cross-origin (notably user-configured TFS hosts):
 *   bypass the SW entirely (no respondWith), so the browser handles TLS
 *   exactly as if no SW was installed. Intercepting API GETs breaks hosts
 *   with self-signed/invalid certs and risks caching API data.
 * Non-GET requests (Azure DevOps API writes) always go to the network.
 */

const CACHE = "flowerpot-v2";
const APP_SHELL = "./index.html";

// Origins whose GET responses are safe to cache for offline use.
const STATIC_ORIGINS = new Set([
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://raw.githubusercontent.com",
]);

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

    // Cross-origin: only cache known static CDNs (Google Fonts,
    // raw.githubusercontent dynamic-content). Anything else — notably the
    // user-configured TFS host — must bypass the SW so TLS/cert handling
    // stays identical to "no SW installed".
    if (url.origin !== self.location.origin) {
        if (!STATIC_ORIGINS.has(url.origin)) return;
        event.respondWith(
            caches.match(request).then(
                (hit) =>
                    hit ||
                    fetch(request)
                        .then((response) => cacheInBackground(request, response))
                        .catch(() => hit)
            )
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
