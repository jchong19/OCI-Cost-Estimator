// 오프라인 지원용 Service Worker.
// 네트워크 우선: 온라인이면 항상 최신 단가/화면을 받고, 오프라인일 때만 캐시를 사용한다.
// 파일 목록이 바뀌면 CACHE 버전을 올리세요.
const CACHE = 'oci-estimator-v2';
const ASSETS = [
  './', './index.html', './desktop.html',
  './style.css', './desktop.css',
  './pricing-catalog.js', './app.js', './desktop.js', './pwa.js',
  './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
