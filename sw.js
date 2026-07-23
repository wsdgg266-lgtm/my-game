/* かいわすれナシ！ Service Worker - オフライン対応 */
var CACHE_NAME = 'kaiwasure-v11';
/* 大きなファイル(OCR等)用の長期キャッシュ。アプリ更新では消さない */
var VENDOR_CACHE = 'kaiwasure-vendor-v1';
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
        if (key !== CACHE_NAME && key !== VENDOR_CACHE) return caches.delete(key);
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
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  // vendor配下(OCR・バーコードの大きなファイル)はキャッシュ優先で再ダウンロードを防ぐ
  if (url.pathname.indexOf('/vendor/') !== -1) {
    e.respondWith(
      caches.match(e.request).then(function (cached) {
        if (cached) return cached;
        return fetch(e.request).then(function (res) {
          var copy = res.clone();
          caches.open(VENDOR_CACHE).then(function (cache) { cache.put(e.request, copy); });
          return res;
        });
      })
    );
    return;
  }
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
