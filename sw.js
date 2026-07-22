// Service Worker — офлайн-режим для «Учёт топлива» (нужен только для версии на GitHub Pages;
// в Tauri-приложении и при открытии локального файла офлайн и так работает сам по себе).
const CACHE_NAME = 'fueltrack-v1';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './pwa-icon-192.png', './pwa-icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Главная страница: сначала сеть (чтобы при наличии интернета всегда видеть свежую версию),
  // при отсутствии сети — отдаём последнюю сохранённую копию из кэша, чтобы приложение открылось офлайн.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(res => res || caches.match('./')))
    );
    return;
  }

  // Остальное (иконки, манифест): сначала кэш (быстро и работает офлайн), в фоне обновляем на будущее.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
