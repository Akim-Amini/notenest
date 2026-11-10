const SHELL_CACHE = 'notenest-shell-v2';
const RUNTIME_CACHE = 'notenest-runtime-v2';
const APP_CACHE_PREFIXES = ['notenest-', 'notes-and-lists-'];
const APP_SCOPE = self.registration.scope;
const APP_ROOT = new URL('./', APP_SCOPE).href;
const INDEX_URL = new URL('index.html', APP_SCOPE).href;
const PRECACHE_URLS = [
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch(INDEX_URL, { cache: 'reload' });
      if (!response.ok) {
        throw new Error(`Failed to precache app shell: ${response.status}`);
      }

      const html = await response.text();
      const assets = Array.from(
        html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g),
        (match) => match[1]
      );
      const cache = await caches.open(SHELL_CACHE);
      const appShell = new Response(html, {
        headers: response.headers,
      });

      await cache.put(APP_ROOT, appShell.clone());
      await cache.put(INDEX_URL, appShell);
      await cache.addAll([
        ...PRECACHE_URLS.map((url) => new URL(url, APP_SCOPE).href),
        ...assets,
      ]);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              APP_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix)) &&
              cacheName !== SHELL_CACHE &&
              cacheName !== RUNTIME_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match(APP_ROOT)) || (await cache.match(INDEX_URL));
      })
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    })()
  );
});
