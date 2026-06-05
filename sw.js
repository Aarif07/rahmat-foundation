const CACHE_NAME = 'rahmat-foundation-offline-v10';

const urlsToCache = [
  '/rahmat-foundation/',
  '/rahmat-foundation/index.html',
  '/rahmat-foundation/admin.html',
  '/rahmat-foundation/manifest.json',
  '/rahmat-foundation/logo.png',
  '/rahmat-foundation/icon-96.png',
  '/rahmat-foundation/icon-128.png',
  '/rahmat-foundation/icon-144.png',
  '/rahmat-foundation/icon-192.png',
  '/rahmat-foundation/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));

            return networkResponse;
          });
      })
      .catch(() => {
        return caches.match('/rahmat-foundation/index.html');
      })
  );
});
