// Service Worker for PlayCanvas Caching
const CACHE_NAME = 'playcanvas-cache-v1';
const PLAYCANVAS_ASSETS = [
  '/node_modules/playcanvas/build/playcanvas.min.js',
  '/node_modules/playcanvas/build/playcanvas.js'
];

// Install event - cache PlayCanvas assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching PlayCanvas assets');
        return cache.addAll(PLAYCANVAS_ASSETS);
      })
      .catch((error) => {
        console.error('Failed to cache PlayCanvas assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && (cacheName.startsWith('playcanvas-cache-') || cacheName.startsWith('sparkjs-cache-'))) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache first for PlayCanvas assets
self.addEventListener('fetch', (event) => {
  // Only handle PlayCanvas related requests
  if (PLAYCANVAS_ASSETS.some(asset => event.request.url.includes(asset)) || 
      event.request.url.includes('playcanvas')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available
          if (response) {
            return response;
          }
          
          // Otherwise fetch from network and cache
          return fetch(event.request)
            .then((response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
        })
    );
  }
});