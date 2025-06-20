const CACHE_NAME = 'lista-compras-cache-v4';
const OFFLINE_PAGE = './fallback.html';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './lib/chart.min.js',
  './icon-192.png',
  './fallback.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request) || caches.match(OFFLINE_PAGE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
});