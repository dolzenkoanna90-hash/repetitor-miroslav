const CACHE = 'academy-offline-v5';
const FILES = ['./', './index.html', './styles.css', './content.js', './course.js', './app.js', './manifest.webmanifest', './assets/app-icon.svg', './assets/spider-hero.jpeg', './assets/batman.jpeg', './assets/captain-america.jpeg', './assets/iron-man.jpeg', './assets/hulk.jpeg', './assets/thor.jpeg', './assets/nyc-night.png'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('academy-offline-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
 if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
 const url = new URL(event.request.url);
 if (!FILES.some(file => new URL(file, self.location.href).pathname === url.pathname)) return;
 event.respondWith(fetch(event.request).then(response => {
  if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
  return response;
 }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
