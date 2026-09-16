// シールアルバム Service Worker
// 写真もデータも端末内(IndexedDB)なので、シェルをキャッシュすればオフラインでも使える。
//
// HTML はネットワークを先に見る(network first)。
// キャッシュを先に見る作りだと、一度ホーム画面に追加した端末へ更新が永久に届かなくなる。
// 画像などの変わらないファイルはキャッシュを先に見て、裏で静かに更新する。
const CACHE = 'sealalbum-shell-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
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

const isPage = (req, url) =>
  req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;

  if (isPage(e.request, url)) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
