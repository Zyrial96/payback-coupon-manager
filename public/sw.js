const CACHE_NAME = 'payback-coupon-manager-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Coupon Erinnerung',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'coupon-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Öffnen',
      },
      {
        action: 'dismiss',
        title: 'Schließen',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Payback Coupon Manager', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});