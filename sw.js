let CACHE_NAME = 'restaurant-v1';
let urlsToCache = [
    '/',
    '/css/styles.css',
    '/data/restaurants.json',
    '/img/1.jpg',
    '/img/2.jpg',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/index.html',
    '/restaurant.html'
];

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache.map(function(urlToPrefetch) {
                    return new Request(urlToPrefetch, { mode: 'no-cors' });
                })).then(function() {
                    console.log('All resources have been fetched and cached.');
                });
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.includes('restaurant') && cacheName != CACHE_NAME;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        var responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});