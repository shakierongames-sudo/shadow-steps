const cacheName = "shadow-steps-v03";
const appShell = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/assets/brand/shadow-steps-logo.png",
  "/assets/brand/shadow-steps-icon.png",
  "/assets/characters/hunter-omen.png",
  "/assets/bosses/fenrir-echo-banner.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(appShell)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== cacheName)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(cacheName).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => caches.match("/offline.html"));
    }),
  );
});
