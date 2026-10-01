// 홈 화면 앱(PWA) 설치/오프라인 지원. HTTPS 또는 localhost에서만 동작한다.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
