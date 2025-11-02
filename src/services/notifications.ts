export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

/**
 * Request notification permission
 * @returns Promise resolving to permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  const perm = await Notification.requestPermission();
  return perm;
}

/**
 * Show a rich notification with options
 * @param title - Notification title
 * @param options - Notification options (body, icon, actions, etc.)
 */
export async function showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  
  const notificationOptions: NotificationOptions = {
    badge: '/images/favicon.png',
    icon: '/images/favicon.png',
    ...options,
  };

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && reg.showNotification) {
      await reg.showNotification(title, notificationOptions);
      return;
    }
  } catch (error) {
    console.warn('Service worker notification failed, falling back to browser notification:', error);
  }
  
  // Fallback to browser notification
  new Notification(title, notificationOptions);
}

/**
 * Show a simple local notification (backwards compatible)
 * @param title - Notification title
 * @param body - Notification body text
 */
export async function showLocalNotification(title: string, body?: string): Promise<void> {
  await showNotification(title, { body });
}

/**
 * Show notification for partner actions
 */
export async function showPartnerNotification(title: string, body: string, action?: string): Promise<void> {
  const actions: NotificationAction[] = action ? [
    { action: 'view', title: 'View', icon: '/images/favicon.png' }
  ] : [];
  
  await showNotification(title, {
    body,
    actions,
    tag: 'partner-action',
    requireInteraction: false,
    vibrate: [200, 100, 200],
  });
}

/**
 * Show notification for game events
 */
export async function showGameNotification(title: string, body: string): Promise<void> {
  await showNotification(title, {
    body,
    tag: 'game-event',
    vibrate: [100, 50, 100],
  });
}

/**
 * Clear all notifications with a specific tag
 */
export async function clearNotifications(tag?: string): Promise<void> {
  if (!('Notification' in window)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg && reg.getNotifications) {
    const notifications = await reg.getNotifications({ tag });
    notifications.forEach(n => n.close());
  }
}

