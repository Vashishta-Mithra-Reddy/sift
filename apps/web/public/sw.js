importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDG8Fd982HU3I64vNZH_daqK4BvivyOUA0",
  authDomain: "siftv19.firebaseapp.com",
  projectId: "siftv19",
  storageBucket: "siftv19.firebasestorage.app",
  messagingSenderId: "246822992570",
  appId: "1:246822992570:web:037c6e62ed2389d90e2083",
  measurementId: "G-D2L6HH1Z8E"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon/web-app-manifest-192x192.png',
    data: payload.data,
    badge: '/favicon/web-app-manifest-192x192.png',
    actions: payload.data?.link ? [{
      action: 'view',
      title: 'View'
    }] : []
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Cache name
const CACHE_NAME = 'sift-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/favicon/web-app-manifest-192x192.png',
        '/favicon/web-app-manifest-512x512.png',
        '/offline.html',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.notification.data?.link) {
    event.waitUntil(
      clients.openWindow(event.notification.data.link)
    );
  }
});
