const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![STATIC_CACHE].includes(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  
  // Skip caching for Firebase API calls
  if (req.url.includes('firebase') || req.url.includes('googleapis')) {
    return;
  }
  
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      
      return fetch(req).then((res) => {
        // Only cache successful responses
        if (res.status === 200) {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            // Only cache same-origin requests
            if (req.url.startsWith(self.location.origin)) {
              cache.put(req, copy).catch(() => {});
            }
          });
        }
        return res;
      }).catch(() => {
        // Return cached version if available, even if stale
        return cached;
      });
    })
  );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // This would sync queued actions when back online
  // Implementation depends on your offline queue system
  console.log('[SW] Background sync triggered');
}

