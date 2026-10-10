/* 四神まなびバトル Service Worker（オフライン対応） */
const V='shishin-33a7fd1d9e', IMGC='shishin-img-v1';
const PRE=["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PRE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('shishin-')&&k!==V&&k!==IMGC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // 画像・フォントは 一度読んだら キャッシュから（ファイル名に版が入っているので更新も安全）
  if(u.pathname.includes('/img/')||u.hostname.includes('fonts.g')){
    e.respondWith(caches.open(IMGC).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok||res.type==='opaque')c.put(e.request,res.clone());return res;}))));return;
  }
  // ページ本体は ネット優先・つながらないときは キャッシュ
  e.respondWith(fetch(e.request).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp));return res;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
