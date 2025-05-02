const CACHE_NAME = 'lost-found-cache-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/login.html',
  '/signup.html',
  '/style.css',
  '/index.js',
  '/admin.js',
  '/login.js',
  '/signup.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
  // Optional: '/offline.html'
];

// Install event – cache all static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event – clean old caches
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
    })
  );
});

// Fetch event – handle CDN + app shell
self.addEventListener('fetch', event => {
  const url = event.request.url;

  if (url.startsWith('https://www.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request)
          // Optional fallback
          // .catch(() => caches.match('/offline.html'))
      })
    );
  }
});
