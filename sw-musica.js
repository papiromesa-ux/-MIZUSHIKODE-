const CACHE_NAME = 'ongaku-v2';
const ASSETS = [
  './pages/musica.html',
  './css/ropa.css',
  './css/musica.css',
  './js/sys_musica.js',
  './manifest-musica.json',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './musicaly/mizushikode.mp3' // Caché del himno oficial
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
