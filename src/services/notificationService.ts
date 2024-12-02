import { requestNotificationPermission } from '../config/firebase';

class NotificationService {
  private static instance: NotificationService;
  private hasPermission: boolean = false;

  private constructor() {
    this.init();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }

  private async init() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      
      if (this.hasPermission) {
        const token = await requestNotificationPermission();
        if (token) {
          console.log('FCM Token:', token);
        }
      }
    }
  }

  async showNotification(title: string, options: NotificationOptions = {}) {
    if (!this.hasPermission) {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
    }

    if (this.hasPermission && document.visibilityState !== 'visible') {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  async notifyNewMessage(senderName: string, message: string) {
    await this.showNotification(`New message from ${senderName}`, {
      body: message,
      tag: 'message',
      renotify: true,
    });
  }

  async notifyIncomingCall(callerName: string) {
    await this.showNotification(`Incoming call from ${callerName}`, {
      body: 'Tap to answer',
      tag: 'call',
      renotify: true,
      requireInteraction: true,
    });
  }

  async notifyMediaShare(senderName: string, mediaType: string) {
    await this.showNotification(`${senderName} shared ${mediaType}`, {
      body: `Tap to view ${mediaType}`,
      tag: 'media',
      renotify: true,
    });
  }
}

export const notificationService = NotificationService.getInstance();