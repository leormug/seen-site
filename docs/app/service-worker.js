// public/service-worker.js
// Minimal, no-op service worker for PWA installability.
// Does NOT cache or send any data.
// Version: 20260112143306

self.addEventListener('install', () => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// No fetch handler on purpose:
// - We don't intercept network requests
// - We don't cache or touch any user data
