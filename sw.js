// Service worker do Entregas Control: rede primeiro, cache como reserva offline
const CACHE = 'entregas-v4';
const BASE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {}));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request).then(res => {
            const url = new URL(e.request.url);
            // guarda o próprio app e a biblioteca de mapas (Leaflet) para funcionar sem internet
            if (res.ok && (url.origin === location.origin || url.hostname === 'unpkg.com')) {
                const copy = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, copy));
            }
            return res;
        }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
});
