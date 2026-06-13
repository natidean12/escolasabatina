const CACHE_NAME = "licao-escola-sabatina-v1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll([
                    "./",
                    "./index.html",
                    "./style.css",
                    "./app.js",
                    "./icone1.png"
                ]);
            })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});