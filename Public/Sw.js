const CACHE = 'lectura-rapida-v1';
const CORE = ['./','/index.html','/manifest.webmanifest','/sw.js'];
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(()=>{})));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(event.request, clone)).catch(()=>{});
        return resp;
      }).catch(() => caches.match('./'));
    })
  );
});
