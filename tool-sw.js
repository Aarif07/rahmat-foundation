self.addEventListener('install', function(event) {
    console.log('Tool Service Worker Installed');
    self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request).catch(function() {
        return new Response("Tool is running offline.");
    }));
});
