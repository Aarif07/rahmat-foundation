const CACHE_NAME = 'rahmat-v2';

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

// Stale-While-Revalidate Strategy (Offline functionality and fast loading)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Sirf valid aur success responses ko cache karein
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(() => {
        // Offline hone par network fail hoga, isliye is error ko ignore karein
      });
      
      // Agar cache mein file hai toh turant dikhao, warna network ka intezaar karo
      return cachedResponse || fetchPromise; 
    })
  );
});
