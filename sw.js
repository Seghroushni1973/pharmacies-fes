const VERSION = 'pharmacies-fes-v1';
const COEUR = [
  './',
  './index.html',
  './pharmacies_fes.geojson',
  './manifest.json',
  './icone-192.png',
  './icone-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(COEUR)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Fonds de carte : on garde en cache les tuiles déjà vues
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith(
      caches.open(VERSION).then((c) =>
        c.match(e.request).then((hit) =>
          hit || fetch(e.request).then((rep) => { c.put(e.request, rep.clone()); return rep; })
        )
      ).catch(() => caches.match(e.request))
    );
    return;
  }

  // Pages et données : réseau d'abord (toujours à jour), cache si hors ligne
  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request))
  );
});
