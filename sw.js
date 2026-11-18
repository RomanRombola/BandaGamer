// Service worker de AltoVicio (V15): hace la página instalable (app de Android / Play Store)
// y permite abrirla sin conexión. Estrategia "primero la red": siempre se intenta bajar lo último;
// la copia guardada solo se usa si no hay internet. Así nunca queda una versión vieja trabada.
// Firebase, Google y cualquier otro dominio NO se guardan.
const CACHE = 'altovicio-v15';
const BASE = new URL('./', self.location).href;
const PRECARGA = ['index.html', 'css/styles.css?v=15', 'js/games-data.js?v=15', 'js/storage.js?v=15', 'js/avatar.js?v=15',
  'js/main.js?v=15', 'assets/logo/logo.svg', 'assets/logo/icon-192.png', 'manifest.webmanifest'].map(p => BASE + p);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECARGA.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('altovicio-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(BASE)) return;      // solo este sitio
  e.respondWith(fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' })
    .then(r => r || (req.mode === 'navigate' ? caches.match(BASE + 'index.html') : undefined))
    .then(r => r || new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))));
});
