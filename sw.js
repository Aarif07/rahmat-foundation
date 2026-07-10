const CACHE_NAME = 'rahmat-v2.1';
const APP_FILES = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', event => {
  // ऐप इंस्टॉल होते ही इन फाइलों को हमेशा के लिए सेव कर लो
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_FILES);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // अगर फाइल कैशे में है, तो तुरंत दिखाओ (बिना इंटरनेट का इंतज़ार किए)
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request).then(networkResponse => {
        if(networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        // ऑफलाइन होने पर ऐप क्रैश न हो
      });
    })
  );
});
