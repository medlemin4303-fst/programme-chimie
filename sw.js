// Service Worker - Programme Chimie
// يوفر تخزيناً مؤقتاً لهيكل التطبيق (App Shell) للعمل دون اتصال بالإنترنت.
// ملاحظة: طلبات Firebase (المصادقة، Firestore، Storage) لا يتم تخزينها مؤقتاً أبداً،
// لأنها تتطلب اتصالاً حياً بالخادم.

const CACHE_NAME = 'programme-chimie-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// لا نتدخل أبداً في طلبات Firebase أو Google APIs أو الخطوط الخارجية،
// هذه يجب أن تذهب دائماً مباشرة إلى الشبكة.
const NEVER_CACHE_HOSTS = [
  'firestore.googleapis.com',
  'firebasestorage.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'www.googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.gstatic.com'
];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (NEVER_CACHE_HOSTS.some((host) => url.hostname.includes(host))) {
    return; // اترك الطلب يمر للشبكة كما هو دون أي تدخل
  }

  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // Cache-first لهيكل التطبيق كي يعمل فوراً دون اتصال، مع تحديث في الخلفية
      return cachedResponse || networkFetch;
    })
  );
});
