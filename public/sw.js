const CACHE_NAME = 'shoe-repair-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through for now, can implement caching strategies later if needed
  // This is required to meet PWA installability criteria
});
