/**
 * Service Worker for PWA functionality
 * Cache-first for app shell, network-first for content
 */

const CACHE_VERSION = 'v1';
const CACHE_SHELL = `app-shell-${CACHE_VERSION}`;
const CACHE_RUNTIME = `runtime-${CACHE_VERSION}`;

const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('app-') && name !== CACHE_SHELL && name !== CACHE_RUNTIME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache-first for app shell (navigation)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Network-first for API/data, cache-first for static assets
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    // Network-first for dynamic content
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_RUNTIME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request)
          .then(response => {
            const clone = response.clone();
            caches.open(CACHE_RUNTIME).then(cache => cache.put(request, clone));
            return response;
          })
        )
    );
  }
});
