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
];

// Install event – cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event – clean old caches (optional)
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

// Fetch event – respond from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .catch(() => {
            // You could return a fallback HTML page here
            // return caches.match('/offline.html');
          });
      })
  );
});
