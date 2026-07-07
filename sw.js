const CACHE_NAME = 'rahmat-v3'; // Version badla gaya hai taaki naya cache ban sake

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Purana Cache Delete Ho Gaya');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate Strategy (App ko super fast banane ke liye)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      
      // Background fetch (Net se naya data laakar cache update karega)
      const fetchPromise = fetch(event.request).then(networkResponse => {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Internet nahi hone par crash se bachayega
      });

      // 1. Agar cache mein data hai toh turant (instant) return karega
      // 2. Agar cache mein nahi hai, tabhi network (internet) ka wait karega
      return cachedResponse || fetchPromise;
    })
  );
});

