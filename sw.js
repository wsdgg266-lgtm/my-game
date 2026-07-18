/* かいわすれナシ！ Service Worker - オフライン対応 */
var CACHE_NAME = 'kaiwasure-v10';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/zxing.min.js',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ネットワーク優先・失敗したらキャッシュ(更新を取り込みつつオフラインでも動く)
   外部API(商品検索など)はキャッシュせず素通しする */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var sameOrigin = new URL(e.request.url).origin === self.location.origin;
  if (!sameOrigin) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(e.request, copy);
      });
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
