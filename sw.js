const CACHE_NAME = 'rahmat-v4'; // Naya version

// Zaroori files jo offline ke liye pehle se save karni hain
const URLS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './logo.png'
];

// 1. Install ke time files pre-cache karein
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Offline cache ready');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 2. Purana cache delete karein
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Stale-While-Revalidate (Ignore Search Query ke sath)
self.addEventListener('fetch', event => {
  event.respondWith(
    // ignoreSearch: true ka matlab hai ki agar URL mein ?v=2 hoga toh bhi cache kaam karega
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Nayi file download karke cache update karega
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Agar internet nahi hai aur fetch fail hota hai, toh chupचाप ignore kare
      });

      // Agar cache mein file hai toh turant de dega (Offline Mode)
      return cachedResponse || fetchPromise;
    })
  );
});
