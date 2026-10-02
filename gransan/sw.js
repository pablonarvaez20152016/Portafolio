const CACHE = 'gransan-a5865b83e99ce706';
const ASSETS = ['./', './index.html', './styles.css', './app.mjs', './core.mjs', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './datos_usuario.json', './datos/locales.json', './datos/mapas/piso_1.png', './datos/mapas/piso_2.png', './datos/mapas/piso_3.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('gransan-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
});
