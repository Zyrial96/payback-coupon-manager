// Notification Service für Push-Benachrichtigungen

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    if (!('Notification' in window)) {
      resolve({ granted: false, denied: true, default: false });
      return;
    }

    Notification.requestPermission().then((permission) => {
      resolve({
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      });
    });
  });
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, default: false };
  }

  return {
    granted: Notification.permission === 'granted',
    denied: Notification.permission === 'denied',
    default: Notification.permission === 'default',
  };
}

export function sendNotification(title: string, options?: NotificationOptions): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });
    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

// Check für ablaufende Coupons und sende Benachrichtigungen
export function checkExpiringCoupons(coupons: Array<{ title: string; validUntil: string }>): void {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);

  coupons.forEach((coupon) => {
    const expiryDate = new Date(coupon.validUntil);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Läuft morgen ab
      sendNotification(`⏰ Coupon läuft morgen ab!`, {
        body: `"${coupon.title}" läuft morgen ab. Nicht vergessen einzulösen!`,
        tag: `expiry-${coupon.title}`,
        requireInteraction: true,
      });
    } else if (diffDays === 3) {
      // Läuft in 3 Tagen ab
      sendNotification(`📅 Coupon läuft bald ab`, {
        body: `"${coupon.title}" läuft in 3 Tagen ab.`,
        tag: `expiry-3days-${coupon.title}`,
      });
    }
  });
}

// Service Worker Registration für Background Notifications
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}