/* public/sw.js */
const VERSION = 'v1.1.0-20260109';
const CACHE_NAME = `app-cache-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Get the base path from the service worker's location
      const base = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/') + 1);

      try {
        // Cache the index.html at minimum
        await cache.add(base + 'index.html');
      } catch (err) {
        console.warn('Failed to precache index.html:', err);
      }

      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

// Strategy:
// 1) HTML navigations: network-first, fall back to cached index.html for offline SPA.
// 2) Same-origin static assets: cache-first.
// 3) Others: passthrough.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const isNavigation = request.mode === 'navigate';
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          return fresh;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          // Try to match any cached index.html
          const cached = await cache.match(request) || await cache.match('index.html');
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  if (sameOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        // Network-first for JS files to ensure latest code
        if (url.pathname.endsWith('.js')) {
          try {
            const fresh = await fetch(request);
            if (fresh && fresh.ok) {
              cache.put(request, fresh.clone());
            }
            return fresh;
          } catch {
            const cached = await cache.match(request);
            return cached || Response.error();
          }
        }

        // Cache-first for other assets
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          // Cache successful asset fetches
          if (fresh && fresh.ok && (url.pathname.startsWith('/static/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.css'))) {
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })()
    );
  }
});
