// Service Worker for SparkJS Caching
const CACHE_NAME = 'sparkjs-cache-v1';
const SPARKJS_ASSETS = [
  '/node_modules/three/build/three.module.js',
  '/node_modules/@sparkjsdev/spark/dist/spark.module.js',
  '/node_modules/three-stdlib/controls/OrbitControls.js'
];

// Install event - cache SparkJS assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching SparkJS assets');
        return cache.addAll(SPARKJS_ASSETS);
      })
      .catch((error) => {
        console.error('Failed to cache SparkJS assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('sparkjs-cache-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache first for SparkJS assets
self.addEventListener('fetch', (event) => {
  // Only handle SparkJS related requests
  if (SPARKJS_ASSETS.some(asset => event.request.url.includes(asset))) {
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