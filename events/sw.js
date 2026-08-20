// キタイベ！ Service Worker
// アプリ本体(シェル)とイベントデータをキャッシュし、オフラインでも開けるようにする。
// events.json は「まずネットワーク、だめならキャッシュ」で常に新しい方を出す。
const CACHE = 'kitaibe-shell-v4';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './data/events.json',
  './data/imported.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;

  // サーバー時刻の同期に使う HEAD/キャッシュ無効リクエストは素通しする
  if (e.request.cache === 'no-store' || url.searchParams.has('_t')) return;

  // イベントデータ(手動整備・自動取り込みとも)は常に最新を優先
  if (/\/data\/(events|imported)\.json$/.test(url.pathname)) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
