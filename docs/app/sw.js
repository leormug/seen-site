/* public/sw.js */
const VERSION = 'v0.6.1-20260103-1600';
const CACHE_NAME = `app-cache-${VERSION}`;
const CORE = ['/', '/index.html']; // bootstrap fallback

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const toCache = new Set(CORE);

      try {
        // Precache CRA build assets
        const res = await fetch('/asset-manifest.json', { cache: 'no-store' });
        if (res.ok) {
          const manifest = await res.json();
          const files = Object.values(manifest.files || {});
          for (const url of files) {
            if (typeof url === 'string' && !url.endsWith('.map')) toCache.add(url);
          }
        }
      } catch (_) {
        // ignore offline during install; CORE still caches
      }

      await cache.addAll(Array.from(toCache));
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
          const cached = await cache.match('/index.html');
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
